import argon2 from "argon2";
import request from "supertest";
import app from "../../src/app.js";
import prisma from "../../src/prisma.js";

// Xóa sạch dữ liệu giữa các test, đưa id về 1. Lấy danh sách bảng từ DB
// nên thêm bảng mới (qua migration) không cần sửa lại hàm này.
export async function resetDb() {
  const tables = await prisma.$queryRaw`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'
  `;
  const names = tables.map((t) => `"${t.tablename}"`).join(", ");
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${names} RESTART IDENTITY CASCADE`,
  );
}

let userCounter = 0;

// Tạo user trực tiếp trong DB (bỏ qua API) để test không phụ thuộc vào /register.
export async function createUser({
  role = "staff",
  status = "active",
  password = "secret123",
} = {}) {
  userCounter += 1;
  const user = await prisma.user.create({
    data: {
      name: `User ${userCounter}`,
      email: `user${userCounter}@example.com`,
      password_hash: await argon2.hash(password),
      role,
      status,
    },
  });
  return { ...user, password };
}

// Tạo user rồi đăng nhập qua API thật, trả về accessToken để gắn vào header Authorization.
export async function loginAs(options) {
  const user = await createUser(options);
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });
  return { user, accessToken: res.body.accessToken };
}

export async function createProduct(overrides = {}) {
  return prisma.product.create({
    data: {
      name: "Sản phẩm mẫu",
      sku: `SKU-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      category: "Danh mục",
      supplier: "Nhà cung cấp",
      price: 10000,
      stock: 0,
      ...overrides,
    },
  });
}

export { app, prisma };
