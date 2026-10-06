const argon2 = require("argon2");

function createError(message, statusCode){
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;   
}
class AuthService {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async register(data = {}) {
        const {name, email, password, confirmPassword} = data;
        if(!name.trim() || !email.trim() || !password || !confirmPassword) {
            throw createError("Vui lòng nhập đầy đủ thông tin", 400);
        }
        if(
            typeof name !== "string" ||
            typeof email !== "string" ||
            typeof password !== "string" ||
            typeof confirmPassword !== "string"
        ) {
            throw createError("Thông tin không hợp lệ", 400);
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
}
module.exports = AuthService;
