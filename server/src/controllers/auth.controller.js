const { createAccessToken } = require("../utils/token");
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }
  register = async (req, res, next) => {
    try {
      const user = await this.authService.register(req.body);
      return res.status(201).json({
        message: "Đăng ký thành công",
        user,
      });
    } catch (error) {
      next(error);
    }
  };
  login = async (req, res, next) => {
    try {
      const { user, refreshToken, refreshTokenExpiresAt } =
        await this.authService.login(req.body);

      const accessToken = createAccessToken(user.id);
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
        expires: refreshTokenExpiresAt,
      });
      res.set("cache-control", "no-store");
      return res.status(200).json({
        message: "Đăng nhập thành công",
        user,
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  };
  logout = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await this.authService.logout(refreshToken);
      }

      res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
      });

      res.set("Cache-Control", "no-store");

      return res.status(200).json({
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      next(error);
    }
  };
  refresh = async (req, res, next) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      const result = await this.authService.refresh(refreshToken);

      const accessToken = createAccessToken(result.userId);

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
        expires: result.refreshTokenExpiresAt,
      });

      res.set("Cache-Control", "no-store");

      return res.status(200).json({
        message: "Làm mới token thành công",
        accessToken,
      });
    } catch (error) {
      next(error);
    }
  };
}
module.exports = AuthController;
