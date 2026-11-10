class GoodsIssueService {
  constructor(goodsIssueRepository) {
    this.goodsIssueRepository = goodsIssueRepository;
  }

  async getIssues() {
    return this.goodsIssueRepository.findAll();
  }

  async createWithItems(createdBy, items) {
    function badRequest(message) {
      const error = new Error(message);
      error.statusCode = 400;
      return error;
    }

    // Kiểm tra người tạo.
    if (!Number.isInteger(createdBy) || createdBy <= 0) {
      throw badRequest("ID người tạo không hợp lệ.");
    }

    // Kiểm tra danh sách sản phẩm.
    if (!Array.isArray(items) || items.length === 0) {
      throw badRequest("Phiếu xuất phải có ít nhất một sản phẩm.");
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
        throw badRequest("Số lượng xuất phải là số nguyên dương.");
      }

      if (productIds.has(productId)) {
        throw badRequest(
          "Một sản phẩm chỉ được xuất hiện một lần trong phiếu.",
        );
      }

      productIds.add(productId);
      validItems.push({ productId, quantity });
    }

    return this.goodsIssueRepository.createWithItems(createdBy, validItems);
  }
  async confirm(issueId, confirmedBy) {
    function badRequest(message) {
      const error = new Error(message);
      error.statusCode = 400;
      return error;
    }

    if (!Number.isInteger(issueId) || issueId <= 0) {
      throw badRequest("ID phiếu xuất không hợp lệ.");
    }

    if (!Number.isInteger(confirmedBy) || confirmedBy <= 0) {
      throw badRequest("ID người xác nhận không hợp lệ.");
    }

    return this.goodsIssueRepository.confirm(issueId, confirmedBy);
  }
}
module.exports = GoodsIssueService;
