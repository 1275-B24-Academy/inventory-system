// Tạo tài khoản mẫu để đăng nhập ngay sau khi dựng DB mới (vd `docker compose up` lần đầu).
// Chạy: npm run db:seed
//
// Idempotent: chạy nhiều lần không tạo trùng. upsert theo email (cột UNIQUE):
// chưa có thì tạo, có rồi thì giữ nguyên (update rỗng), nên không ghi đè mật khẩu
// nếu bạn đã đổi.
//
// CHỈ dùng cho dev/demo: mật khẩu công khai trong README.
import argon2 from "argon2";

import prisma from "../src/prisma.js";

const SEED_USERS = [
  {
    name: "Admin",
    email: "admin@example.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Staff",
    email: "staff@example.com",
    password: "staff123",
    role: "staff",
  },
];

async function main() {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Không chạy seed khi NODE_ENV=production (mật khẩu seed là công khai).",
    );
  }

  for (const { password, ...user } of SEED_USERS) {
    // Hash giống AuthService.register để đăng nhập qua API như tài khoản thật.
    const passwordHash = await argon2.hash(password);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: { ...user, password_hash: passwordHash, status: "active" },
    });

    console.log(`Seed user: ${user.email} (${user.role})`);
  }
}

try {
  await main();
} finally {
  // Đóng connection pool, nếu không process node không thoát.
  await prisma.$disconnect();
}
