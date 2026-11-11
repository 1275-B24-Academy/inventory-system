import { execFileSync } from "node:child_process";
import pg from "pg";
import { TEST_DATABASE_URL, TEST_ENV } from "../testEnv.js";

// Tạo DB test nếu chưa có. Postgres không tự tạo DB khi có kết nối tới,
// nên phải nối vào DB hệ thống `postgres` để chạy CREATE DATABASE.
async function ensureDatabase(dbName) {
  const adminUrl = new URL(TEST_DATABASE_URL);
  adminUrl.pathname = "/postgres";

  const client = new pg.Client({ connectionString: adminUrl.toString() });
  await client.connect();
  try {
    const { rowCount } = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (rowCount === 0) {
      // Tên DB không truyền tham số $1 được trong CREATE DATABASE, nhưng đã được
      // kiểm tra regex ở setup() nên an toàn khi ghép chuỗi.
      await client.query(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await client.end();
  }
}

// Chạy một lần trước toàn bộ integration test: tạo DB (nếu cần) rồi áp migration.
export default async function setup() {
  // Chốt an toàn: helper resetDb() TRUNCATE mọi bảng, tuyệt đối không để nó trỏ vào DB thật.
  const dbName = new URL(TEST_DATABASE_URL).pathname.slice(1);
  if (!/^[A-Za-z0-9_]+_test$/.test(dbName)) {
    throw new Error(
      `Tên DB test phải kết thúc bằng "_test" và chỉ gồm chữ, số, "_" (đang là "${dbName}"). Kiểm tra TEST_DATABASE_URL.`,
    );
  }

  await ensureDatabase(dbName);

  execFileSync("npx", ["--no-install", "prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, ...TEST_ENV },
  });
}
