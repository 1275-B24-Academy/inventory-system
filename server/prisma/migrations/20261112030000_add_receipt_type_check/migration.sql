ALTER TABLE "goods_receipts"
ADD CONSTRAINT "goods_receipts_receipt_type_check"
CHECK ("receipt_type" IN ('NORMAL', 'OPENING'));