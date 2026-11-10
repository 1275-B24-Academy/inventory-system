import pool from "../db.js";

class GoodsReceiptRepository {
  async findAll() {
    const result = await pool.query(
      `SELECT
       gr.id,
       gr.status,
       gr.created_by,
       creator.name AS created_by_name,
       gr.created_at,
       gr.confirmed_by,
       confirmer.name AS confirmed_by_name,
       gr.confirmed_at
     FROM goods_receipts AS gr
     JOIN users AS creator
       ON creator.id = gr.created_by
     LEFT JOIN users AS confirmer
       ON confirmer.id = gr.confirmed_by
     ORDER BY gr.created_at DESC, gr.id DESC`,
    );

    return result.rows;
  }
  async createDraft(createdBy) {
    const result = await pool.query(
      `INSERT INTO goods_receipts (created_by)
       VALUES ($1)
       RETURNING *`,
      [createdBy],
    );

    return result.rows[0];
  }
  async createWithItems(createdBy, items) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Tạo phiếu nháp.
      const receiptResult = await client.query(
        `INSERT INTO goods_receipts (created_by)
         VALUES ($1)
         RETURNING *`,
        [createdBy],
      );

      const receipt = receiptResult.rows[0];
      const savedItems = [];

      // Thêm các dòng sản phẩm vào phiếu vừa tạo.
      for (const item of items) {
        const itemResult = await client.query(
          `INSERT INTO goods_receipt_items (
             receipt_id,
             product_id,
             quantity
           )
           VALUES ($1, $2, $3)
           RETURNING *`,
          [receipt.id, item.productId, item.quantity],
        );

        savedItems.push(itemResult.rows[0]);
      }

      await client.query("COMMIT");

      return {
        ...receipt,
        items: savedItems,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async confirm(receiptId, confirmedBy) {
    const client = await pool.connect();

    function createError(message, statusCode) {
      const error = new Error(message);
      error.statusCode = statusCode;
      return error;
    }

    try {
      await client.query("BEGIN");

      // 1. Khóa phiếu để tránh hai request xác nhận cùng lúc.
      const receiptResult = await client.query(
        `SELECT id, status
        FROM goods_receipts
        WHERE id = $1
        FOR UPDATE`,
        [receiptId],
      );

      const receipt = receiptResult.rows[0];

      if (!receipt) {
        throw createError("Phiếu nhập không tồn tại.", 404);
      }

      if (receipt.status !== "draft") {
        throw createError("Phiếu nhập đã được xác nhận.", 409);
      }

      // 2. Lấy và khóa các dòng chi tiết.
      const itemsResult = await client.query(
        `SELECT id, product_id, quantity
        FROM goods_receipt_items
        WHERE receipt_id = $1
        ORDER BY product_id
        FOR UPDATE`,
        [receiptId],
      );

      const items = itemsResult.rows;

      if (items.length === 0) {
        throw createError("Phiếu nhập chưa có sản phẩm.", 400);
      }

      // 3. Cộng tồn và ghi lịch sử cho từng sản phẩm.
      for (const item of items) {
        const productResult = await client.query(
          `UPDATE products
            SET stock = stock + $1
            WHERE id = $2
            RETURNING id`,
          [item.quantity, item.product_id],
        );

        if (productResult.rows.length === 0) {
          throw createError("Sản phẩm trong phiếu không tồn tại.", 404);
        }

        await client.query(
          `INSERT INTO stock_movements (
            receipt_item_id,
            quantity
            )
            VALUES ($1, $2)`,
          [item.id, item.quantity],
        );
      }

      // 4. Đổi trạng thái và lưu người xác nhận.
      const confirmedResult = await client.query(
        `UPDATE goods_receipts
        SET status = 'confirmed',
            confirmed_by = $1,
            confirmed_at = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *`,
        [confirmedBy, receiptId],
      );

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

export default GoodsReceiptRepository;
