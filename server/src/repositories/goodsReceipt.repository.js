import { createError } from "../utils/httpError.js";
import { next } from "./documentSequence.repository.js";
class GoodsReceiptRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createDraft(createdBy) {
    return this.prisma.$transaction(async (tx) => {
      const documentNo = await next(tx, "PN");
      return tx.goodsReceipt.create({
        data: { document_no: documentNo, created_by: createdBy },
      });
    });
  }

  async createWithItems(createdBy, items, receiptType = "NORMAL") {
    return this.prisma.$transaction(async (tx) => {
      const documentNo = await next(tx, "PN");

      return tx.goodsReceipt.create({
        data: {
          document_no: documentNo,
          created_by: createdBy,
          receipt_type: receiptType,
          items: {
            create: items.map((item) => ({
              product_id: item.productId,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          items: { orderBy: { id: "asc" } },
        },
      });
    });
  }

  async confirm(receiptId, confirmedBy) {
    // Mọi bước chạy trong 1 transaction: lỗi ở bước nào thì rollback toàn bộ.
    return this.prisma.$transaction(async (tx) => {
      // 1. Đổi trạng thái draft -> confirmed. Điều kiện status = 'draft' nằm TRONG câu
      //    update: UPDATE khóa dòng tới hết transaction, nên 2 request xác nhận cùng lúc
      //    thì request sau phải chờ, rồi không còn khớp điều kiện -> count = 0.
      const locked = await tx.goodsReceipt.updateMany({
        where: { id: receiptId, status: "draft" },
        data: {
          status: "confirmed",
          confirmed_by: confirmedBy,
          confirmed_at: new Date(),
        },
      });

      if (locked.count === 0) {
        // Không update được: hoặc không có phiếu, hoặc phiếu đã xác nhận.
        const receipt = await tx.goodsReceipt.findUnique({
          where: { id: receiptId },
          select: { id: true },
        });

        if (!receipt) {
          throw createError("Phiếu nhập không tồn tại.", 404);
        }

        throw createError("Phiếu nhập đã được xác nhận.", 409);
      }

      // 2. Lấy các dòng chi tiết, sắp theo product_id để mọi transaction khóa sản phẩm
      //    theo cùng một thứ tự -> tránh deadlock.
      const items = await tx.goodsReceiptItem.findMany({
        where: { receipt_id: receiptId },
        orderBy: { product_id: "asc" },
        select: { id: true, product_id: true, quantity: true },
      });

      if (items.length === 0) {
        throw createError("Phiếu nhập chưa có sản phẩm.", 400);
      }
      // Đọc phiếu đã xác nhận một lần để lấy mã và trả về cuối hàm.
      const receipt = await tx.goodsReceipt.findUniqueOrThrow({
        where: { id: receiptId },
      });
      // 3. Cộng tồn và ghi lịch sử cho từng sản phẩm.
      for (const item of items) {
        const product = await tx.product.updateMany({
          where: { id: item.product_id },
          data: { stock: { increment: item.quantity } },
        });

        if (product.count === 0) {
          throw createError("Sản phẩm trong phiếu không tồn tại.", 404);
        }

        const updatedProduct = await tx.product.findUniqueOrThrow({
          where: { id: item.product_id },
          select: { stock: true },
        });

        await tx.stockMovement.create({
          data: {
            receipt_item_id: item.id,
            product_id: item.product_id,
            type: "RECEIPT",
            quantity: item.quantity,
            balance_after: updatedProduct.stock,
            document_type: "GOODS_RECEIPT",
            document_id: receiptId,
            created_by: confirmedBy,
            document_no: receipt.document_no,
          },
        });
      }

      return receipt;
    });
  }
}

export default GoodsReceiptRepository;
