require("dotenv").config();
const { Pool } = require("pg");

// Production (Render + Neon): dùng DATABASE_URL, SSL bật qua `?sslmode=require` trong chuỗi.
// Local: dùng các biến DB_* riêng lẻ.
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

module.exports = pool;
