import { idParams, objectBody } from "./common.js";
import { goodsItems } from "./goods.schemas.js";

export const createGoodsIssueBody = objectBody({
  items: goodsItems("xuất"),
});

export const goodsIssueIdParams = idParams("ID phiếu xuất không hợp lệ.");
