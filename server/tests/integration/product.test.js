import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, createProduct, loginAs, prisma, resetDb } from "./helpers.js";

const newProduct = {
  name: "Bút bi",
  sku: "PEN-001",
  category: "Văn phòng phẩm",
  supplier: "Thiên Long",
  price: 5000,
  stock: 10,
};

describe("/api/products", () => {
  beforeEach(resetDb);

  it("rejects request without access token with 401", async () => {
    const res = await request(app).get("/api/products");

    expect(res.status).toBe(401);
    expect(res.body.code).toBe("AUTH_REQUIRED");
  });

  it("lets staff list products", async () => {
    const { accessToken } = await loginAs({ role: "staff" });
    await createProduct({ sku: "A-1" });

    const res = await request(app)
      .get("/api/products")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].sku).toBe("A-1");
  });

  it("forbids staff from creating products", async () => {
    const { accessToken } = await loginAs({ role: "staff" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(newProduct);

    expect(res.status).toBe(403);
    expect(await prisma.product.count()).toBe(0);
  });

  it("lets admin create a product and persists it", async () => {
    const { accessToken } = await loginAs({ role: "admin" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(newProduct);

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ sku: "PEN-001", price: 5000, stock: 10 });
    expect(await prisma.product.count()).toBe(1);
  });

  it("returns 409 when SKU already exists", async () => {
    const { accessToken } = await loginAs({ role: "admin" });
    await createProduct({ sku: "PEN-001" });

    const res = await request(app)
      .post("/api/products")
      .set("Authorization", `Bearer ${accessToken}`)
      .send(newProduct);

    expect(res.status).toBe(409);
    expect(res.body.message).toBe("SKU đã tồn tại");
  });

  // TODO cho TTS: viết các test còn thiếu (xem các test phía trên làm mẫu).
  it.todo("returns 400 when creating a product with invalid data");
  it.todo("lets admin update a product (PUT /api/products/:id)");
  it.todo("forbids staff from updating products");
  it.todo("returns 404 when updating a product that does not exist");
  it.todo("returns 409 when updating a product to an existing SKU");
});
