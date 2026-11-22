class GoodsReceiptService {
  constructor(goodsReceiptRepository) {
    this.goodsReceiptRepository = goodsReceiptRepository;
  }

  async createDraft(createdBy) {
    if (!Number.isInteger(createdBy) || createdBy <= 0) {
      const error = new Error("ID người tạo không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    return this.goodsReceiptRepository.createDraft(createdBy);
  }

  async createWithItems(createdBy, items, receiptType = "NORMAL") {
    if (!Number.isInteger(createdBy) || createdBy <= 0) {
      const error = new Error("ID người tạo không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    return this.goodsReceiptRepository.createWithItems(
      createdBy,
      items,
      receiptType,
    );
  }

  async confirm(receiptId, confirmedBy) {
    if (!Number.isSafeInteger(confirmedBy) || confirmedBy <= 0) {
      const error = new Error("ID người xác nhận không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    return this.goodsReceiptRepository.confirm(receiptId, confirmedBy);
  }
}
export default GoodsReceiptService;
