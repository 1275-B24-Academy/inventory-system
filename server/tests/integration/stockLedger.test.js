import request from "supertest";
import { beforeEach, expect, it } from "vitest";
import {
  app,
  assertLedgerInvariant,
  createProduct,
  loginAs,
  resetDb,
  prisma,
} from "./helpers.js";

beforeEach(resetDb);

it("giữ sổ kho khớp với tồn sau khi xác nhận phiếu nhập", async () => {
  const { accessToken } = await loginAs({ role: "admin" });
  const product = await createProduct();
  const authorization = `Bearer ${accessToken}`;

  const created = await request(app)
    .post("/api/goods-receipts")
    .set("Authorization", authorization)
    .send({ items: [{ productId: product.id, quantity: 5 }] });

  expect(created.status).toBe(201);

  const confirmed = await request(app)
    .post(`/api/goods-receipts/${created.body.receipt.id}/confirm`)
    .set("Authorization", authorization);

  expect(confirmed.status).toBe(200);
  await assertLedgerInvariant();

  const receiptMovement = await prisma.stockMovement.findFirstOrThrow({
    where: { product_id: product.id, type: "RECEIPT" },
  });

  expect(receiptMovement).toMatchObject({
    quantity: 5,
    balance_after: 5,
    document_type: "GOODS_RECEIPT",
    document_id: created.body.receipt.id,
  });

  const createdIssue = await request(app)
    .post("/api/goods-issues")
    .set("Authorization", authorization)
    .send({ items: [{ productId: product.id, quantity: 3 }] });

  expect(createdIssue.status).toBe(201);

  const confirmedIssue = await request(app)
    .post(`/api/goods-issues/${createdIssue.body.issue.id}/confirm`)
    .set("Authorization", authorization);

  expect(confirmedIssue.status).toBe(200);
  await assertLedgerInvariant();
  const issueMovement = await prisma.stockMovement.findFirstOrThrow({
    where: {
      product_id: product.id,
      type: "ISSUE",
    },
  });

  expect(issueMovement).toMatchObject({
    quantity: -3,
    balance_after: 2,
    document_type: "GOODS_ISSUE",
    document_id: createdIssue.body.issue.id,
  });
});
