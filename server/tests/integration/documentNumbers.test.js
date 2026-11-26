import request from "supertest";
import { beforeEach, expect, it, vi } from "vitest";
import GoodsReceiptRepository from "../../src/repositories/goodsReceipt.repository.js";
import { next } from "../../src/repositories/documentSequence.repository.js";
import { app, createProduct, loginAs, prisma, resetDb } from "./helpers.js";

const currentYear = () =>
  new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
  }).format(new Date());

beforeEach(resetDb);

it("allocates 50 consecutive receipt numbers concurrently", async () => {
  const { accessToken } = await loginAs({ role: "admin" });
  const product = await createProduct();
  const year = currentYear();
  const responses = await Promise.all(
    Array.from({ length: 50 }, () =>
      request(app)
        .post("/api/goods-receipts")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ items: [{ productId: product.id, quantity: 1 }] }),
    ),
  );

  expect(responses.map(({ status }) => status)).toEqual(Array(50).fill(201));
  expect(responses.map(({ body }) => body.receipt.document_no).sort()).toEqual(
    Array.from(
      { length: 50 },
      (_, index) => `PN-${year}-${String(index + 1).padStart(5, "0")}`,
    ),
  );
}, 20_000);

it("reuses a number when saving the receipt fails and copies codes to the ledger", async () => {
  const { accessToken, user } = await loginAs({ role: "admin" });
  const product = await createProduct();
  const receipts = new GoodsReceiptRepository(prisma);
  const year = currentYear();
  const authorization = `Bearer ${accessToken}`;
  const items = [{ productId: product.id, quantity: 2 }];

  const draft = await receipts.createDraft(user.id);
  expect(draft.document_no).toBe(`PN-${year}-00001`);
  await expect(
    receipts.createWithItems(user.id, [...items, ...items]),
  ).rejects.toMatchObject({
    code: "P2002",
  });

  const receipt = await request(app)
    .post("/api/goods-receipts")
    .set("Authorization", authorization)
    .send({ items });
  expect(receipt.status).toBe(201);
  expect(receipt.body.receipt.document_no).toBe(`PN-${year}-00002`);
  const received = await request(app)
    .post(`/api/goods-receipts/${receipt.body.receipt.id}/confirm`)
    .set("Authorization", authorization);
  expect(received.status).toBe(200);

  const issue = await request(app)
    .post("/api/goods-issues")
    .set("Authorization", authorization)
    .send({ items });
  expect(issue.status).toBe(201);
  expect(issue.body.issue.document_no).toBe(`PX-${year}-00001`);
  const issued = await request(app)
    .post(`/api/goods-issues/${issue.body.issue.id}/confirm`)
    .set("Authorization", authorization);
  expect(issued.status).toBe(200);

  const movements = await prisma.stockMovement.findMany({
    orderBy: { id: "asc" },
    select: { document_no: true, quantity: true },
  });
  expect(movements).toEqual([
    { document_no: receipt.body.receipt.document_no, quantity: 2 },
    { document_no: issue.body.issue.document_no, quantity: -2 },
  ]);
});

it("allocates DC independently and starts a new sequence at Vietnamese midnight", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  try {
    vi.setSystemTime(new Date("2026-12-31T16:59:00Z"));
    expect(await prisma.$transaction((tx) => next(tx, "PN"))).toBe(
      "PN-2026-00001",
    );
    expect(await prisma.$transaction((tx) => next(tx, "DC"))).toBe(
      "DC-2026-00001",
    );
    expect(await prisma.$transaction((tx) => next(tx, "DC"))).toBe(
      "DC-2026-00002",
    );
    vi.setSystemTime(new Date("2026-12-31T17:00:00Z"));
    expect(await prisma.$transaction((tx) => next(tx, "DC"))).toBe(
      "DC-2027-00001",
    );
  } finally {
    vi.useRealTimers();
  }
});
