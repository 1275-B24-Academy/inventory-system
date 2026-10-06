const pool = require("../db");
class ProductRepository {
  async findAll() {
    const result = await pool.query(
      `SELECT id, name, sku, category, supplier, price, stock FROM products ORDER BY id`
    );
    return result.rows;
  }
  
  async create(product) {
    const { name, sku, category, supplier, price, stock } = product;
    const result = await pool.query(
      `INSERT INTO products (name, sku, category, supplier, price, stock)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, sku, category, supplier, price, stock`,
      [name, sku, category, supplier, price, stock]
    );
    return result.rows[0];
  }
  async update(id, product) {
    const { name, sku, category, supplier, price, stock } = product;
    const result = await pool.query(
      `UPDATE products
      SET name = $1,
          sku = $2,
          category = $3,
          supplier = $4,
          price = $5,
          stock = $6
      WHERE id = $7
      RETURNING id, name, sku, category, supplier, price, stock`,
      [name, sku, category, supplier, price, stock, id]
    );
    return result.rows[0];
  }
}
module.exports = ProductRepository
