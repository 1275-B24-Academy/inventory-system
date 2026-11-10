class RefreshTokenRepository {
  constructor(prisma) {
    this.prisma = prisma;
  }

  async create({ userId, tokenHash, familyId, expiresAt }) {
    return this.prisma.refreshToken.create({
      data: {
        user_id: userId,
        token_hash: tokenHash,
        family_id: familyId,
        expires_at: expiresAt,
      },
      select: {
        id: true,
        user_id: true,
        family_id: true,
        created_at: true,
        expires_at: true,
      },
    });
  }

  async findByTokenHash(tokenHash) {
    return this.prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
      select: {
        id: true,
        user_id: true,
        token_hash: true,
        family_id: true,
        expires_at: true,
        revoked_at: true,
      },
    });
  }

  async rotate({ oldTokenId, tokenHash, familyId, expiresAt }) {
    return this.prisma.$transaction(async (tx) => {
      // Thu hồi token cũ. Điều kiện "chưa thu hồi, chưa hết hạn" nằm TRONG câu update:
      // UPDATE khóa dòng tới hết transaction, nên 2 request refresh cùng lúc với cùng
      // 1 token thì request sau phải chờ, rồi thấy revoked_at đã có giá trị -> count = 0.
      // (Nếu đọc token ra rồi so sánh trong JS thì cả 2 request đều lọt qua.)
      const revoked = await tx.refreshToken.updateMany({
        where: {
          id: oldTokenId,
          revoked_at: null,
          expires_at: { gt: new Date() },
        },
        data: { revoked_at: new Date() },
      });

      // Token đã hết hạn, đã bị thu hồi hoặc đã được đổi trước đó.
      if (revoked.count !== 1) {
        return false;
      }

      const oldToken = await tx.refreshToken.findUnique({
        where: { id: oldTokenId },
        select: { user_id: true },
      });

      await tx.refreshToken.create({
        data: {
          user_id: oldToken.user_id,
          token_hash: tokenHash,
          family_id: familyId,
          expires_at: expiresAt,
        },
      });

      return true;
    });
  }

  async revokeFamily(familyId) {
    // Chỉ thu hồi token chưa bị thu hồi, giữ nguyên revoked_at của token cũ.
    await this.prisma.refreshToken.updateMany({
      where: { family_id: familyId, revoked_at: null },
      data: { revoked_at: new Date() },
    });
  }

  async revokeById(id) {
    const result = await this.prisma.refreshToken.updateMany({
      where: { id, revoked_at: null },
      data: { revoked_at: new Date() },
    });

    return result.count === 1;
  }
}

export default RefreshTokenRepository;
