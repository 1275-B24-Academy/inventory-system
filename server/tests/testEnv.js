import dotenv from "dotenv";

// Đọc server/.env để lấy TEST_DATABASE_URL (nếu bạn đặt ở đó). Không ghi đè biến đã có sẵn trên shell/CI.
dotenv.config({ quiet: true });

// DB dành riêng cho integration test (KHÔNG dùng chung với DB dev, vì test sẽ TRUNCATE sạch dữ liệu).
// - Local: tạo DB trống `createdb inventory_test`, đổi user/password trong .env nếu cần.
// - CI: Postgres service của GitHub Actions, truyền qua biến TEST_DATABASE_URL.
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/inventory_test";

// Env cho process chạy test. Vitest set trước khi import code của app,
// và dotenv không ghi đè biến đã có, nên giá trị trong server/.env sẽ không lọt vào test.
export const TEST_ENV = {
  NODE_ENV: "test",
  DATABASE_URL: TEST_DATABASE_URL,
  DATABASE_URL_UNPOOLED: TEST_DATABASE_URL,
  JWT_ACCESS_SECRET: "test-access-secret",
};
