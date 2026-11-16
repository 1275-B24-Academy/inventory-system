import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductService from "../../src/services/product.service.js";

// Unit test: service chạy thật, repository được thay bằng mock -> không cần DB.
// Việc kiểm tra dữ liệu đầu vào (thiếu trường, giá âm, id sai...) nằm ở schema Zod,
// xem schemas.test.js. Service chỉ giữ logic cần DB (vd 404 khi sản phẩm không tồn tại).
describe("ProductService.createProduct", () => {
  let productRepository;
  let service;

  const validProduct = {
    name: "Bút bi",
    sku: "PEN-001",
    category: "Văn phòng phẩm",
    supplier: "Thiên Long",
    price: 5000,
  };

  beforeEach(() => {
    productRepository = { create: vi.fn(async (data) => ({ id: 1, ...data })) };
    service = new ProductService(productRepository);
  });

  it("passes the validated fields to the repository", async () => {
    await service.createProduct(validProduct);

    expect(productRepository.create).toHaveBeenCalledWith(validProduct);
  });
});

// TODO cho TTS: viết unit test cho updateProduct (làm tương tự describe ở trên).
describe("ProductService.updateProduct", () => {
  it.todo("throws 404 when repository returns undefined");
  it.todo("returns the updated product");
});
