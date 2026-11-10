class GoodsReceiptService {
  constructor(goodsReceiptRepository) {
    this.goodsReceiptRepository = goodsReceiptRepository;
  }

  async getReceipts() {
    return this.goodsReceiptRepository.findAll();
  }

  async createDraft(createdBy) {
    if (!Number.isInteger(createdBy) || createdBy <= 0) {
      const error = new Error("ID người tạo không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    return this.goodsReceiptRepository.createDraft(createdBy);
  }

  async createWithItems(createdBy, items) {
    function badRequest(message) {
      const error = new Error(message);
      error.statusCode = 400;
      return error;
    }

    if (!Number.isInteger(createdBy) || createdBy <= 0) {
      throw badRequest("ID người tạo không hợp lệ.");
    }

    if (!Array.isArray(items) || items.length === 0) {
      throw badRequest("Phiếu nhập phải có ít nhất một sản phẩm.");
    }

    const productIds = new Set();
    const validItems = [];

    for (const item of items) {
      if (item === null || typeof item !== "object" || Array.isArray(item)) {
        throw badRequest("Dòng sản phẩm không hợp lệ.");
      }

      const { productId, quantity } = item;

      if (!Number.isInteger(productId) || productId <= 0) {
        throw badRequest("ID sản phẩm phải là số nguyên dương.");
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw badRequest("Số lượng nhập phải là số nguyên dương.");
      }

      if (productIds.has(productId)) {
        throw badRequest(
          "Một sản phẩm chỉ được xuất hiện một lần trong phiếu.",
        );
      }

      productIds.add(productId);
      validItems.push({ productId, quantity });
    }

    return this.goodsReceiptRepository.createWithItems(createdBy, validItems);
  }

  async confirm(receiptId, confirmedBy) {
    if (!Number.isSafeInteger(receiptId) || receiptId <= 0) {
      const error = new Error("ID phiếu nhập không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    if (!Number.isSafeInteger(confirmedBy) || confirmedBy <= 0) {
      const error = new Error("ID người xác nhận không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    return this.goodsReceiptRepository.confirm(receiptId, confirmedBy);
  }
}

module.exports = GoodsReceiptService;
