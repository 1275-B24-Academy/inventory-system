import argon2 from "argon2";
import { randomUUID } from "node:crypto";
import { createRefreshToken, hashRefreshToken } from "../utils/refreshToken.js";
import { createError } from "../utils/httpError.js";

class AuthService {
  constructor(userRepository, refreshTokenRepository) {
    this.userRepository = userRepository;
    this.refreshTokenRepository = refreshTokenRepository;
  }

  // data đã được validate (và chuẩn hóa trim/lowercase) bởi registerBody ở route.
  async register({ name, email, password }) {
    const existingUser = await this.userRepository.findbyEmail(email);
    if (existingUser) {
      throw createError("Email đã được sử dụng", 409);
    }

    const passwordHash = await argon2.hash(password);
    return await this.userRepository.create({
      name,
      email,
      password_hash: passwordHash,
    });
  }
  // data đã được validate bởi loginBody ở route.
  async login({ email, password }) {
    const user = await this.userRepository.findbyEmail(email);
    if (!user) {
      throw createError("Email hoặc mật khẩu không đúng", 401);
    }
    const isPasswordValid = await argon2.verify(user.password_hash, password);
    if (!isPasswordValid) {
      throw createError("Email hoặc mật khẩu không đúng", 401);
    }
    if (user.status === "pending") {
      throw createError("Tài khoản chưa được kích hoạt", 403);
    }
    if (user.status !== "active") {
      throw createError("Tài khoản đã bị khóa", 403);
    }
    const refreshToken = createRefreshToken();
    const tokenHash = hashRefreshToken(refreshToken);
    const familyId = randomUUID();
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await this.refreshTokenRepository.create({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt,
    });
    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
      refreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }

  async logout(refreshToken) {
    if (typeof refreshToken !== "string" || refreshToken.length === 0) {
      return;
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken) {
      return;
    }

    await this.refreshTokenRepository.revokeById(storedToken.id);
  }

  async refresh(refreshToken) {
    if (typeof refreshToken !== "string" || refreshToken.length === 0) {
      throw createError("Bạn cần đăng nhập lại", 401);
    }

    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    // 4. Không tìm thấy thì từ chối.
    if (!storedToken) {
      throw createError("Refresh token không hợp lệ", 401);
    }

    if (storedToken.revoked_at) {
      await this.refreshTokenRepository.revokeFamily(storedToken.family_id);

      throw createError(
        "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại",
        401,
      );
    }

    // 3. Kiểm tra thời hạn.
    if (new Date(storedToken.expires_at).getTime() <= Date.now()) {
      throw createError("Refresh token đã hết hạn", 401);
    }

    const user = await this.userRepository.findById(storedToken.user_id);
    if (!user || user.status !== "active") {
      await this.refreshTokenRepository.revokeFamily(storedToken.family_id);

      throw createError(
        "Tài khoản không còn được phép sử dụng. Vui lòng đăng nhập lại",
        401,
      );
    }
    // 4. Sinh Refresh Token mới.
    const newRefreshToken = createRefreshToken();
    const newTokenHash = hashRefreshToken(newRefreshToken);

    // 5. Gia hạn 30 ngày kể từ thời điểm đổi token.
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // 6. Thu hồi token cũ và lưu token mới.
    const rotated = await this.refreshTokenRepository.rotate({
      oldTokenId: storedToken.id,
      tokenHash: newTokenHash,
      familyId: storedToken.family_id,
      expiresAt,
    });

    if (!rotated) {
      throw createError(
        "Refresh token không còn hợp lệ. Vui lòng thử đăng nhập lại",
        401,
      );
    }

    // 7. Trả token mới cho controller.
    return {
      userId: String(storedToken.user_id),
      refreshToken: newRefreshToken,
      refreshTokenExpiresAt: expiresAt,
    };
  }
}
export default AuthService;
