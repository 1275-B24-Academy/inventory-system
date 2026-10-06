class AuthController {
    constructor(authService) {
        this.authService = authService;
    }
    register = async (req, res, next) => {
        try{
            const user = await this.authService.register(req.body);
            return res.status(201).json({
                message: "Đăng ký thành công",
                user
            });
        }
        catch(error) {
           next(error);
        }
    }
}
module.exports = AuthController;