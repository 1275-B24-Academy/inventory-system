import { describe, expect, it } from "vitest";
import { loginBody, registerBody } from "../../src/schemas/auth.schemas.js";
import {
  createProductBody,
  productIdParams,
  updateProductBody,
} from "../../src/schemas/product.schemas.js";

// Test schema Zod thuần: không cần mock, không cần DB. Mỗi test chỉ gọi safeParse.
// Helper: lấy danh sách message lỗi (rỗng nếu hợp lệ).
const messages = (result) =>
  result.success ? [] : result.error.issues.map((issue) => issue.message);

describe("registerBody", () => {
  const valid = {
    name: "  An  ",
    email: "  An@Example.COM ",
    password: "secret123",
    confirmPassword: "secret123",
  };

  it("trims name and normalizes email", () => {
    const result = registerBody.safeParse(valid);

    expect(result.success).toBe(true);
    expect(result.data).toMatchObject({
      name: "An",
      email: "an@example.com",
    });
  });

  it("rejects invalid email", () => {
    const result = registerBody.safeParse({ ...valid, email: "not-an-email" });

    expect(messages(result)).toEqual(["Email không hợp lệ"]);
  });

  it.each(["12345", "x".repeat(21)])("rejects password %j", (password) => {
    const result = registerBody.safeParse({
      ...valid,
      password,
      confirmPassword: password,
    });

    expect(messages(result)).toEqual(["Mật khẩu phải từ 6 đến 20 ký tự"]);
  });

  it("rejects mismatched confirmPassword", () => {
    const result = registerBody.safeParse({
      ...valid,
      confirmPassword: "different",
    });

    expect(messages(result)).toEqual(["Mật khẩu xác nhận không khớp"]);
  });

  it("rejects missing fields and non-object body", () => {
    expect(registerBody.safeParse({}).success).toBe(false);
    expect(messages(registerBody.safeParse([]))).toEqual([
      "Dữ liệu không hợp lệ",
    ]);
  });
});

describe("loginBody", () => {
  it("normalizes email", () => {
    const result = loginBody.safeParse({ email: " A@b.c ", password: "x" });

    expect(result.data).toEqual({ email: "a@b.c", password: "x" });
  });

  it("rejects non-string and empty values", () => {
    expect(loginBody.safeParse({ email: 1, password: "x" }).success).toBe(
      false,
    );
    expect(loginBody.safeParse({ email: "a@b.c", password: "" }).success).toBe(
      false,
    );
  });
});

describe("createProductBody", () => {
  const valid = {
    name: "Bút bi",
    sku: "PEN-001",
    category: "Văn phòng phẩm",
    supplier: "Thiên Long",
    price: 5000,
  };

  it("accepts numeric and numeric-string price", () => {
    expect(createProductBody.safeParse(valid).data.price).toBe(5000);
    expect(
      createProductBody.safeParse({ ...valid, price: "5000" }).data.price,
    ).toBe(5000);
    expect(createProductBody.safeParse({ ...valid, price: 0 }).success).toBe(
      true,
    );
  });

  it.each([-1, "", "  ", null, undefined, "abc", true, Infinity])(
    "rejects price %j",
    (price) => {
      const result = createProductBody.safeParse({ ...valid, price });

      expect(messages(result)).toEqual(["Giá phải là số không âm"]);
    },
  );

  it.each(["name", "sku", "category", "supplier"])(
    "rejects missing or blank %s",
    (field) => {
      expect(
        createProductBody.safeParse({ ...valid, [field]: undefined }).success,
      ).toBe(false);
      expect(
        createProductBody.safeParse({ ...valid, [field]: "   " }).success,
      ).toBe(false);
    },
  );

  it("trims text fields", () => {
    const result = createProductBody.safeParse({ ...valid, sku: " PEN-001 " });

    expect(result.data.sku).toBe("PEN-001");
  });

  it("drops stock instead of failing", () => {
    const result = createProductBody.safeParse({ ...valid, stock: 10 });

    expect(result.success).toBe(true);
    expect(result.data).not.toHaveProperty("stock");
  });
});

describe("updateProductBody", () => {
  const valid = {
    name: "Bút bi",
    sku: "PEN-001",
    category: "Văn phòng phẩm",
    supplier: "Thiên Long",
    price: 5000,
  };

  it("accepts valid data without stock", () => {
    expect(updateProductBody.safeParse(valid).success).toBe(true);
  });

  it("rejects any stock field", () => {
    const result = updateProductBody.safeParse({ ...valid, stock: 0 });

    expect(messages(result)).toEqual([
      "Tồn kho chỉ thay đổi qua phiếu nhập/xuất",
    ]);
  });

  it("rejects empty price", () => {
    expect(updateProductBody.safeParse({ ...valid, price: "" }).success).toBe(
      false,
    );
  });
});

describe("productIdParams", () => {
  it("converts digit strings to numbers", () => {
    expect(productIdParams.safeParse({ id: "12" }).data).toEqual({ id: 12 });
  });

  it.each(["abc", "1.5", "-3", "0", "0x10", "", " 1"])(
    "rejects id %j",
    (id) => {
      const result = productIdParams.safeParse({ id });

      expect(messages(result)).toEqual(["ID sản phẩm không hợp lệ"]);
    },
  );
});

describe("goods receipt / goods issue schemas", () => {
  it.todo("accepts items with positive integer productId and quantity");
  it.todo("rejects empty items");
  it.todo("rejects negative, zero or fractional quantity");
  it.todo("rejects duplicated productId");
  it.todo("receiptType defaults to NORMAL, rejects unknown value");
  it.todo("id params: rejects non-numeric id");
});
