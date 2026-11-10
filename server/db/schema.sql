-- Schema suy ra từ các câu SQL trong server/src/repositories và validate trong services.
-- Chạy 1 lần trên DB trống:  psql "$DATABASE_URL" -f server/db/schema.sql
--
-- Ghi chú:
-- - id dùng INTEGER (không BIGINT): node-pg trả BIGINT dạng string, còn code
--   kiểm tra Number.isInteger(...) và client nhận id dạng number.
-- - Tên ràng buộc users_email_key, products_sku_key được errorHandler dùng để
--   trả 409 -> giữ nguyên tên mặc định của Postgres cho UNIQUE.

BEGIN;

CREATE TABLE users (
  id            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'staff',
  status        TEXT        NOT NULL DEFAULT 'active',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT users_email_key UNIQUE (email),
  CONSTRAINT users_role_check CHECK (role IN ('admin', 'staff')),
  CONSTRAINT users_status_check CHECK (status IN ('pending', 'active', 'locked'))
);

CREATE TABLE refresh_tokens (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id    INTEGER     NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash TEXT        NOT NULL, -- SHA-256 hex của refresh token
  family_id  UUID        NOT NULL, -- chung cho chuỗi token xoay vòng từ 1 lần đăng nhập
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash)
);

CREATE INDEX refresh_tokens_family_id_idx ON refresh_tokens (family_id);
CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens (user_id);

CREATE TABLE products (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name       TEXT          NOT NULL,
  sku        TEXT          NOT NULL,
  category   TEXT          NOT NULL,
  supplier   TEXT          NOT NULL,
  price      NUMERIC(14, 2) NOT NULL DEFAULT 0,
  stock      INTEGER       NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  CONSTRAINT products_sku_key UNIQUE (sku),
  CONSTRAINT products_price_check CHECK (price >= 0),
  -- Lưới an toàn cuối cùng: dù code lỗi, tồn kho cũng không thể âm.
  CONSTRAINT products_stock_check CHECK (stock >= 0)
);

-- Phiếu nhập
CREATE TABLE goods_receipts (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status       TEXT        NOT NULL DEFAULT 'draft',
  created_by   INTEGER     NOT NULL REFERENCES users (id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_by INTEGER     REFERENCES users (id),
  confirmed_at TIMESTAMPTZ,
  CONSTRAINT goods_receipts_status_check CHECK (status IN ('draft', 'confirmed'))
);

CREATE TABLE goods_receipt_items (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  receipt_id INTEGER NOT NULL REFERENCES goods_receipts (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id),
  quantity   INTEGER NOT NULL,
  CONSTRAINT goods_receipt_items_quantity_check CHECK (quantity > 0),
  -- Service đã chặn 1 sản phẩm xuất hiện 2 lần trong cùng phiếu.
  CONSTRAINT goods_receipt_items_receipt_product_key UNIQUE (receipt_id, product_id)
);

-- Phiếu xuất
CREATE TABLE goods_issues (
  id           INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  status       TEXT        NOT NULL DEFAULT 'draft',
  created_by   INTEGER     NOT NULL REFERENCES users (id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_by INTEGER     REFERENCES users (id),
  confirmed_at TIMESTAMPTZ,
  CONSTRAINT goods_issues_status_check CHECK (status IN ('draft', 'confirmed'))
);

CREATE TABLE goods_issue_items (
  id         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  issue_id   INTEGER NOT NULL REFERENCES goods_issues (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id),
  quantity   INTEGER NOT NULL,
  CONSTRAINT goods_issue_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT goods_issue_items_issue_product_key UNIQUE (issue_id, product_id)
);

-- Lịch sử biến động kho: mỗi dòng gắn với đúng 1 dòng phiếu nhập HOẶC phiếu xuất.
-- quantity luôn dương; chiều (+/-) suy ra từ cột nào khác NULL.
CREATE TABLE stock_movements (
  id              INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  receipt_item_id INTEGER     REFERENCES goods_receipt_items (id),
  issue_item_id   INTEGER     REFERENCES goods_issue_items (id),
  quantity        INTEGER     NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT stock_movements_quantity_check CHECK (quantity > 0),
  CONSTRAINT stock_movements_source_check CHECK (num_nonnulls(receipt_item_id, issue_item_id) = 1)
);

CREATE UNIQUE INDEX stock_movements_receipt_item_key ON stock_movements (receipt_item_id)
  WHERE receipt_item_id IS NOT NULL;
CREATE UNIQUE INDEX stock_movements_issue_item_key ON stock_movements (issue_item_id)
  WHERE issue_item_id IS NOT NULL;

COMMIT;

-- Sau khi đăng ký tài khoản qua giao diện, nâng quyền admin:
--   UPDATE users SET role = 'admin' WHERE email = 'you@example.com';
