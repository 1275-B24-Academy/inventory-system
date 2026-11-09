const pool = require("../db");

class GoodsIssueRepository {
  // Tạo phiếu xuất nháp kèm danh sách sản phẩm.
  async createWithItems(createdBy, items) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1. Tạo phiếu xuất nháp.
      const issueResult = await client.query(
        `INSERT INTO goods_issues (created_by)
                 VALUES ($1)
                 RETURNING *`,
        [createdBy],
      );

      const issue = issueResult.rows[0];
      const savedItems = [];

      // 2. Thêm các sản phẩm vào phiếu xuất.
      for (const item of items) {
        const itemResult = await client.query(
          `INSERT INTO goods_issue_items (
                        issue_id,
                        product_id,
                        quantity
                    )
                    VALUES ($1, $2, $3)
                    RETURNING *`,
          [issue.id, item.productId, item.quantity],
        );

        savedItems.push(itemResult.rows[0]);
      }

      await client.query("COMMIT");

      return {
        ...issue,
        items: savedItems,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Xác nhận phiếu xuất và trừ tồn kho.
  async confirm(issueId, confirmedBy) {
    const client = await pool.connect();

    function createError(message, statusCode) {
      const error = new Error(message);
      error.statusCode = statusCode;
      return error;
    }

    try {
      await client.query("BEGIN");

      // 1. Tìm và khóa phiếu xuất.
      const issueResult = await client.query(
        `SELECT id, status
                 FROM goods_issues
                 WHERE id = $1
                 FOR UPDATE`,
        [issueId],
      );

      const issue = issueResult.rows[0];

      if (!issue) {
        throw createError("Phiếu xuất không tồn tại.", 404);
      }

      // 2. Chỉ cho phép xác nhận phiếu nháp.
      if (issue.status !== "draft") {
        throw createError("Phiếu xuất đã được xác nhận.", 409);
      }

      // 3. Lấy danh sách sản phẩm trong phiếu.
      const itemResult = await client.query(
        `SELECT id, product_id, quantity
                 FROM goods_issue_items
                 WHERE issue_id = $1
                 ORDER BY product_id
                 FOR UPDATE`,
        [issueId],
      );

      const items = itemResult.rows;

      if (items.length === 0) {
        throw createError("Phiếu xuất không có sản phẩm.", 400);
      }

      // 4. Kiểm tra tồn kho và trừ kho.
      for (const item of items) {
        const stockResult = await client.query(
          `SELECT id, stock
                     FROM products
                     WHERE id = $1
                     FOR UPDATE`,
          [item.product_id],
        );

        const product = stockResult.rows[0];

        if (!product) {
          throw createError(`Sản phẩm ${item.product_id} không tồn tại.`, 404);
        }
        console.log("PRODUCT:", product);
        console.log("STOCK:", product.stock);
        console.log("QUANTITY:", item.quantity);
        if (product.stock < item.quantity) {
          throw createError(
            `Sản phẩm ${item.product_id} không đủ tồn kho.`,
            409,
          );
        }

        // Trừ số lượng tồn kho.
        await client.query(
          `UPDATE products
                     SET stock = stock - $1
                     WHERE id = $2`,
          [item.quantity, item.product_id],
        );

        // 5. Ghi lịch sử xuất kho.
        await client.query(
          `INSERT INTO stock_movements (
                        issue_item_id,
                        quantity
                    )
                    VALUES ($1, $2)`,
          [item.id, item.quantity],
        );
      }

      // 6. Cập nhật trạng thái phiếu xuất.
      const confirmedResult = await client.query(
        `UPDATE goods_issues
                 SET status = 'confirmed',
                     confirmed_by = $1,
                     confirmed_at = CURRENT_TIMESTAMP
                 WHERE id = $2
                 RETURNING *`,
        [confirmedBy, issueId],
      );

      // 7. Lưu toàn bộ transaction.
      await client.query("COMMIT");

      return confirmedResult.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = GoodsIssueRepository;
