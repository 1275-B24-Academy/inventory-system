class GoodsIssueController {
  constructor(goodsIssueService) {
    this.goodsIssueService = goodsIssueService;
  }

  getIssues = async (req, res, next) => {
    try {
      const issues = await this.goodsIssueService.getIssues();
      res.status(200).json({
        message: "Lấy danh sách phiếu xuất thành công.",
        issues,
      });
    } catch (error) {
      next(error);
    }
  };

  createWithItems = async (req, res, next) => {
    try {
      const createdBy = req.user.id;
      const { items } = req.body;
      const issue = await this.goodsIssueService.createWithItems(
        createdBy,
        items,
      );
      res.status(201).json({
        message: "Tạo phiếu xuất nháp thành công.",
        issue,
      });
    } catch (error) {
      next(error);
    }
  };

  confirm = async (req, res, next) => {
    try {
      const issueId = Number(req.params.id);
      const confirmedBy = req.user.id;

      const issue = await this.goodsIssueService.confirm(issueId, confirmedBy);
      res.status(200).json({
        message: "Xác nhận phiếu xuất thành công.",
        issue,
      });
    } catch (error) {
      next(error);
    }
  };
}

module.exports = GoodsIssueController;
