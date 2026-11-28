BEGIN;

CREATE TABLE IF NOT EXISTS document_sequences (
  doc_type TEXT NOT NULL,
  year INTEGER NOT NULL,
  last_no INTEGER NOT NULL,
  PRIMARY KEY (doc_type, year)
);

ALTER TABLE goods_receipts ADD COLUMN IF NOT EXISTS document_no TEXT;
ALTER TABLE goods_issues ADD COLUMN IF NOT EXISTS document_no TEXT;
LOCK TABLE document_sequences IN SHARE ROW EXCLUSIVE MODE;

-- Keep assigned numbers and append to each existing sequence.
CREATE TEMP TABLE document_number_backfill ON COMMIT DROP AS
WITH documents AS (
  SELECT 'PN' AS doc_type, id, created_at, document_no FROM goods_receipts
  UNION ALL
  SELECT 'PX', id, created_at, document_no FROM goods_issues
),
assigned AS (
  SELECT doc_type, split_part(document_no, '-', 2)::integer AS year,
         MAX(split_part(document_no, '-', 3)::integer) AS last_no
  FROM documents
  WHERE document_no IS NOT NULL
  GROUP BY 1, 2
)
SELECT doc_type, year, last_no, NULL::integer AS document_id
FROM assigned
UNION ALL
SELECT pending.doc_type, pending.year,
       GREATEST(COALESCE(assigned.last_no, 0), COALESCE(sequence.last_no, 0))
         + ROW_NUMBER() OVER (
             PARTITION BY pending.doc_type, pending.year
             ORDER BY pending.created_at, pending.id
           ) AS last_no,
       pending.id
FROM (
  SELECT doc_type, id, created_at,
         EXTRACT(YEAR FROM created_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::integer AS year
  FROM documents
  WHERE document_no IS NULL
) AS pending
LEFT JOIN assigned USING (doc_type, year)
LEFT JOIN document_sequences AS sequence USING (doc_type, year);

UPDATE goods_receipts AS receipt
SET document_no = FORMAT('PN-%s-%s', backfill.year,
                         LPAD(backfill.last_no::text, GREATEST(5, LENGTH(backfill.last_no::text)), '0'))
FROM document_number_backfill AS backfill
WHERE backfill.doc_type = 'PN' AND backfill.document_id = receipt.id;

UPDATE goods_issues AS issue
SET document_no = FORMAT('PX-%s-%s', backfill.year,
                         LPAD(backfill.last_no::text, GREATEST(5, LENGTH(backfill.last_no::text)), '0'))
FROM document_number_backfill AS backfill
WHERE backfill.doc_type = 'PX' AND backfill.document_id = issue.id;

INSERT INTO document_sequences (doc_type, year, last_no)
SELECT doc_type, year, MAX(last_no)::integer
FROM document_number_backfill
GROUP BY doc_type, year
ON CONFLICT (doc_type, year) DO UPDATE
SET last_no = GREATEST(document_sequences.last_no, EXCLUDED.last_no);

UPDATE stock_movements AS movement
SET document_no = receipt.document_no
FROM goods_receipts AS receipt
WHERE movement.document_type = 'GOODS_RECEIPT'
  AND movement.document_id = receipt.id
  AND movement.document_no IS NULL;

UPDATE stock_movements AS movement
SET document_no = issue.document_no
FROM goods_issues AS issue
WHERE movement.document_type = 'GOODS_ISSUE'
  AND movement.document_id = issue.id
  AND movement.document_no IS NULL;

ALTER TABLE goods_receipts ALTER COLUMN document_no SET NOT NULL;
ALTER TABLE goods_issues ALTER COLUMN document_no SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS goods_receipts_document_no_key ON goods_receipts (document_no);
CREATE UNIQUE INDEX IF NOT EXISTS goods_issues_document_no_key ON goods_issues (document_no);

COMMIT;
