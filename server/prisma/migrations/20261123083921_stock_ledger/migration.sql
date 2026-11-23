ALTER TABLE "stock_movements"
  ADD COLUMN "balance_after" INTEGER,
  ADD COLUMN "created_by" INTEGER,
  ADD COLUMN "document_id" INTEGER,
  ADD COLUMN "document_no" TEXT,
  ADD COLUMN "document_type" TEXT,
  ADD COLUMN "product_id" INTEGER,
  ADD COLUMN "type" TEXT,
  ADD COLUMN "unit_cost" DECIMAL(14,2);

ALTER TABLE "stock_movements"
  DROP CONSTRAINT "stock_movements_quantity_check",
  DROP CONSTRAINT "stock_movements_source_check";

UPDATE "stock_movements" AS movement
SET
  "product_id" = item."product_id",
  "type" = 'RECEIPT',
  "document_type" = 'GOODS_RECEIPT',
  "document_id" = item."receipt_id"
FROM "goods_receipt_items" AS item
WHERE movement."receipt_item_id" = item."id";

UPDATE "stock_movements" AS movement
SET
  "product_id" = item."product_id",
  "type" = 'ISSUE',
  "document_type" = 'GOODS_ISSUE',
  "document_id" = item."issue_id",
  "quantity" = -movement."quantity"
FROM "goods_issue_items" AS item
WHERE movement."issue_item_id" = item."id";

INSERT INTO "stock_movements" ("product_id", "type", "quantity")
SELECT
  product."id",
  'ADJUST',
  product."stock" - COALESCE(SUM(movement."quantity"), 0)
FROM "products" AS product
LEFT JOIN "stock_movements" AS movement
  ON movement."product_id" = product."id"
GROUP BY product."id", product."stock"
HAVING product."stock" <> COALESCE(SUM(movement."quantity"), 0);

WITH running_balances AS (
  SELECT
    "id",
    SUM("quantity") OVER (
      PARTITION BY "product_id"
      ORDER BY "created_at", "id"
      ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS balance
  FROM "stock_movements"
)
UPDATE "stock_movements" AS movement
SET "balance_after" = running_balances.balance
FROM running_balances
WHERE movement."id" = running_balances."id";

ALTER TABLE "stock_movements"
  ALTER COLUMN "product_id" SET NOT NULL,
  ALTER COLUMN "type" SET NOT NULL,
  ALTER COLUMN "balance_after" SET NOT NULL,
  ADD CONSTRAINT "stock_movements_quantity_check"
    CHECK ("quantity" <> 0),
  ADD CONSTRAINT "stock_movements_type_check"
    CHECK ("type" IN ('RECEIPT', 'ISSUE', 'ADJUST', 'REVERSAL')),
  ADD CONSTRAINT "stock_movements_source_check"
    CHECK (
      ("type" = 'ADJUST' AND num_nonnulls("receipt_item_id", "issue_item_id") = 0)
      OR
      ("type" <> 'ADJUST' AND num_nonnulls("receipt_item_id", "issue_item_id") = 1)
    );