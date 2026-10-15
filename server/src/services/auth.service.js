const argon2 = require("argon2");
const { randomUUID } = require("node:crypto");
const {
  createRefreshToken,
  hashRefreshToken
} = require("../utils/refreshToken");

function createError(message, statusCode){
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;   
}
class AuthService {
    constructor(userRepository, refreshTokenRepository) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    async register(data = {}) {

        if(data === null || typeof data !== "object" || Array.isArray(data)){
            throw createError("Dữ liệu không hợp lệ", 400);
        }

        const {name, email, password, confirmPassword} = data;
        if(
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof confirmPassword !== "string"
        ) {
            throw createError("Thông tin không hợp lệ", 400);
        }
         if(!name.trim() || !email.trim() || !password || !confirmPassword) {
            throw createError("Vui lòng nhập đầy đủ thông tin", 400);
        }
        const nomalizedEmail = email.trim().toLowerCase();
        const nomalizedName = name.trim();
        
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nomalizedEmail)) {
            throw createError("Email không hợp lệ", 400);
        }
        if(password.length < 6 || password.length > 20) {
            throw createError("Mật khẩu phải từ 6 đến 20 ký tự", 400);
        }
        if(password !== confirmPassword) {
            throw createError("Mật khẩu xác nhận không khớp", 400);
        }
        const existingUser = await this.userRepository.findbyEmail(nomalizedEmail);
        if(existingUser) {
            throw createError("Email đã được sử dụng", 409);
        }

        const passwordHash = await argon2.hash(password);
            return await this.userRepository.create({
                name: nomalizedName,
                email: nomalizedEmail,
                password_hash: passwordHash
        });

        
    }
    async login(data = {}){
        if(data === null || typeof data !== "object" || Array.isArray(data)){
            throw createError("Dữ liệu không hợp lệ", 400);
        }
        
        const {email, password} = data;
        if(typeof email !== "string" || typeof password !== "string"){
            throw createError("Email và mật khẩu không hợp lệ", 400);
        }
        const nomalizedEmail = email.trim().toLowerCase();
        if(!nomalizedEmail || !password) {
            throw createError("Vui lòng nhập đầy đủ thông tin", 400);
        }
        const user = await this.userRepository.findbyEmail(nomalizedEmail);
        if(!user) {
            throw createError("Email hoặc mật khẩu không đúng", 401);
        }
        const isPasswordValid = await argon2.verify(user.password_hash, password);
        if(!isPasswordValid) {
            throw createError("Email hoặc mật khẩu không đúng", 401);
        }
        if(user.status === "pending"){
            throw createError("Tài khoản chưa được kích hoạt", 403);
        }
        if(user.status !== "active"){
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
            expiresAt
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
        refreshTokenExpiresAt: expiresAt
        };}

        
    async logout(refreshToken) {
        if (
            typeof refreshToken !== "string" ||
            refreshToken.length === 0
        ) {
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
            if (
                typeof refreshToken !== "string" ||
                refreshToken.length === 0
            ) {
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
                        await this.refreshTokenRepository.revokeFamily(
                        storedToken.family_id
                        );

                        throw createError(
                        "Phiên đăng nhập không còn hợp lệ. Vui lòng đăng nhập lại",
                        401
                        );
                    }

                    // 3. Kiểm tra thời hạn.
                    if (new Date(storedToken.expires_at).getTime() <= Date.now()) {
                        throw createError("Refresh token đã hết hạn", 401);
                    }
                    
                    const user = await this.userRepository.findById(
                        storedToken.user_id
                        );
                        if (!user || user.status !== "active") {
                        await this.refreshTokenRepository.revokeFamily(
                            storedToken.family_id
                        );

                        throw createError(
                            "Tài khoản không còn được phép sử dụng. Vui lòng đăng nhập lại",
                            401
                        );
                        }
                    // 4. Sinh Refresh Token mới.
                    const newRefreshToken = createRefreshToken();
                    const newTokenHash = hashRefreshToken(newRefreshToken);

                    // 5. Gia hạn 30 ngày kể từ thời điểm đổi token.
                    const expiresAt = new Date(
                        Date.now() + 30 * 24 * 60 * 60 * 1000
                    );

                    // 6. Thu hồi token cũ và lưu token mới.
                    const rotated = await this.refreshTokenRepository.rotate({
                        oldTokenId: storedToken.id,
                        tokenHash: newTokenHash,
                        familyId: storedToken.family_id,
                        expiresAt
                    });

                    if (!rotated) {
                        throw createError(
                        "Refresh token không còn hợp lệ. Vui lòng thử đăng nhập lại",
                        401
                        );
                    }

                    // 7. Trả token mới cho controller.
                    return {
                        userId: String(storedToken.user_id),
                        refreshToken: newRefreshToken,
                        refreshTokenExpiresAt: expiresAt
                    };

                        }
}
module.exports = AuthService;
