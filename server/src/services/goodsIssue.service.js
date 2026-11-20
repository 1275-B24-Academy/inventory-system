class GoodsIssueService {
  constructor(goodsIssueRepository) {
    this.goodsIssueRepository = goodsIssueRepository;
  }

  async createWithItems(createdBy, items) {
    if (!Number.isInteger(createdBy) || createdBy <= 0) {
      const error = new Error("ID người tạo không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    return this.goodsIssueRepository.createWithItems(createdBy, items);
  }

  async confirm(issueId, confirmedBy) {
    if (!Number.isInteger(confirmedBy) || confirmedBy <= 0) {
      const error = new Error("ID người xác nhận không hợp lệ.");
      error.statusCode = 400;
      throw error;
    }

    return this.goodsIssueRepository.confirm(issueId, confirmedBy);
  }
}
export default GoodsIssueService;
