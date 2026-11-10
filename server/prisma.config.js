import "dotenv/config";
import { defineConfig } from "prisma/config";

// Cấu hình cho Prisma CLI (migrate, generate, studio...). App lúc chạy dùng src/prisma.js.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Neon: migrate phải dùng URL direct (host không có "-pooler") vì cần advisory lock,
    // connection pooler (PgBouncer) không hỗ trợ. Local chỉ cần DATABASE_URL.
    // Dùng process.env (không dùng env() của Prisma) để `prisma generate` trong CI
    // vẫn chạy được khi chưa có biến này.
    url: process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL,
  },
});
