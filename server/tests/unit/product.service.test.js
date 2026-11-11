import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductService from "../../src/services/product.service.js";

// Unit test: service chạy thật, repository được thay bằng mock -> không cần DB.
describe("ProductService.createProduct", () => {
  let productRepository;
  let service;

  const validProduct = {
    name: "Bút bi",
    sku: "PEN-001",
    category: "Văn phòng phẩm",
    supplier: "Thiên Long",
    price: "5000",
    stock: "10",
  };

  beforeEach(() => {
    productRepository = { create: vi.fn(async (data) => ({ id: 1, ...data })) };
    service = new ProductService(productRepository);
  });

  it("converts price and stock to numbers before saving", async () => {
    await service.createProduct(validProduct);

    expect(productRepository.create).toHaveBeenCalledWith({
      ...validProduct,
      price: 5000,
      stock: 10,
    });
  });

  it("rejects missing required fields with 400", async () => {
    await expect(
      service.createProduct({ ...validProduct, sku: "" }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(productRepository.create).not.toHaveBeenCalled();
  });

  it("rejects negative stock with 400", async () => {
    await expect(
      service.createProduct({ ...validProduct, stock: "-1" }),
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

// TODO cho TTS: viết unit test cho updateProduct (làm tương tự describe ở trên).
describe("ProductService.updateProduct", () => {
  it.todo("rejects invalid product id with 400");
  it.todo("rejects empty price or stock with 400");
  it.todo("throws 404 when repository returns undefined");
  it.todo("returns the updated product");
});
