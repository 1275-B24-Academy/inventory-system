class goodsReceiptController {
    constructor(goodsReceiptService) {
        this.goodsReceiptService = goodsReceiptService;
    }

    createDraft = async (req, res, next) => {
       try {
        const createdBy = req.user.id;
        const receipt = await this.goodsReceiptService.createDraft(createdBy);

        return res.status(201).json({
            message: "Tạo phiếu nhập nháp thành công",
            receipt
        });
       }
         catch(error) {
            next(error);
        }
    };
    createWithItems = async (req, res, next) => {
        try {
            const createdBy = Number(req.user.id);
            const items = req.body?.items;

            const receipt =
            await this.goodsReceiptService.createWithItems(
                createdBy,
                items
            );

            return res.status(201).json({
            message: "Tạo phiếu nhập nháp thành công.",
            receipt,
            });
        } catch (error) {
            next(error);
        }
    };

    confirm = async (req, res, next) => {
        try {
            const receiptId = Number(req.params.id);
            const confirmedBy = Number(req.user.id);

            const receipt = await this.goodsReceiptService.confirm(
            receiptId,
            confirmedBy
            );

            return res.status(200).json({
            message: "Xác nhận phiếu nhập thành công.",
            receipt,
            });
        } catch (error) {
            next(error);
        }
    };
    
}
module.exports = goodsReceiptController;

