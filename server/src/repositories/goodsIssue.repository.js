function createError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

class GoodsIssueRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  // Tạo phiếu xuất nháp kèm danh sách sản phẩm.
  async createWithItems(createdBy, items) {
    // Một lệnh create kèm nested create cho các dòng: Prisma tự chạy trong 1 transaction.
    return this.prisma.goodsIssue.create({
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

  // Xác nhận phiếu xuất và trừ tồn kho.
  async confirm(issueId, confirmedBy) {
    return this.prisma.$transaction(async (tx) => {
      // 1. Đổi trạng thái draft -> confirmed, điều kiện nằm trong câu update để khóa phiếu
      //    (giải thích chi tiết ở GoodsReceiptRepository.confirm).
      const locked = await tx.goodsIssue.updateMany({
        where: { id: issueId, status: "draft" },
        data: {
          status: "confirmed",
          confirmed_by: confirmedBy,
          confirmed_at: new Date(),
        },
      });

      if (locked.count === 0) {
        const issue = await tx.goodsIssue.findUnique({
          where: { id: issueId },
          select: { id: true },
        });

        if (!issue) {
          throw createError("Phiếu xuất không tồn tại.", 404);
        }

        throw createError("Phiếu xuất đã được xác nhận.", 409);
      }

      // 2. Lấy danh sách sản phẩm, sắp theo product_id để tránh deadlock.
      const items = await tx.goodsIssueItem.findMany({
        where: { issue_id: issueId },
        orderBy: { product_id: "asc" },
        select: { id: true, product_id: true, quantity: true },
      });

      if (items.length === 0) {
        throw createError("Phiếu xuất không có sản phẩm.", 400);
      }

      // 3. Trừ kho. Điều kiện "đủ tồn" (stock >= quantity) nằm TRONG câu update:
      //    2 phiếu xuất cùng sản phẩm xác nhận cùng lúc thì phiếu sau phải chờ,
      //    rồi kiểm tra lại với tồn kho mới. Đừng đọc stock ra rồi so sánh trong JS.
      for (const item of items) {
        const product = await tx.product.updateMany({
          where: { id: item.product_id, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (product.count === 0) {
          // Không trừ được: hoặc không có sản phẩm, hoặc không đủ tồn kho.
          const existing = await tx.product.findUnique({
            where: { id: item.product_id },
            select: { id: true },
          });

          if (!existing) {
            throw createError(
              `Sản phẩm ${item.product_id} không tồn tại.`,
              404,
            );
          }

          throw createError(
            `Sản phẩm ${item.product_id} không đủ tồn kho.`,
            409,
          );
        }

        // 4. Ghi lịch sử xuất kho.
        await tx.stockMovement.create({
          data: { issue_item_id: item.id, quantity: item.quantity },
        });
      }

      return tx.goodsIssue.findUnique({ where: { id: issueId } });
    });
  }
}

export default GoodsIssueRepository;
