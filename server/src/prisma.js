import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/index.js";

// Một PrismaClient dùng chung cho cả app (bên trong là một connection pool).
// Đừng tạo PrismaClient mới ở mỗi repository: mỗi client mở pool riêng, dễ hết connection.
// Adapter pg: Prisma đi qua driver `pg` để nói chuyện với Postgres.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

const prisma = new PrismaClient({ adapter });

export default prisma;
