class UserRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async findbyEmail(email) {
    return this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        role: true,
        status: true,
        created_at: true,
      },
    });
  }

  async findById(id) {
    // id có thể là chuỗi (lấy từ `sub` của access token). Prisma kiểm tra kiểu chặt
    // (cột INTEGER phải nhận number) nên đổi sang Number trước khi query.
    return this.prisma.user.findUnique({
      where: { id: Number(id) },
      // Không lấy password_hash: kết quả này được gắn vào req.user.
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  }

  async create(user) {
    const { name, email, password_hash } = user;
    return this.prisma.user.create({
      data: { name, email, password_hash, role: "staff", status: "active" },
      select: {
        id: true,
        name: true,
        email: true,
        password_hash: true,
        role: true,
        status: true,
        created_at: true,
      },
    });
  }
}

export default UserRepository;
