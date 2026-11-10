import pool from "./src/db.js";

async function testConnection() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database_name",
    );

    console.log("Đã kết nối:", result.rows[0].database_name);
  } catch (error) {
    console.error("Kết nối thất bại:", error.message);
  } finally {
    await pool.end();
  }
}

testConnection();
