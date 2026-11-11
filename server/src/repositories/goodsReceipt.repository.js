import { createError } from "../utils/httpError.js";

class GoodsReceiptRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async createDraft(createdBy) {
    return this.prisma.goodsReceipt.create({
      data: { created_by: createdBy },
    });
  }

  async createWithItems(createdBy, items) {
    // Một lệnh create kèm nested create cho các dòng: Prisma tự chạy trong 1 transaction,
    // lỗi ở dòng nào thì cả phiếu cũng không được tạo.
    return this.prisma.goodsReceipt.create({
      data: {
        created_by: createdBy,
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

      // 3. Cộng tồn và ghi lịch sử cho từng sản phẩm.
      for (const item of items) {
        const product = await tx.product.updateMany({
          where: { id: item.product_id },
          data: { stock: { increment: item.quantity } },
        });

        if (product.count === 0) {
          throw createError("Sản phẩm trong phiếu không tồn tại.", 404);
        }

        await tx.stockMovement.create({
          data: { receipt_item_id: item.id, quantity: item.quantity },
        });
      }

      return tx.goodsReceipt.findUnique({ where: { id: receiptId } });
    });
  }
}

export default GoodsReceiptRepository;
