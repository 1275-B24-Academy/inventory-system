import { verifyAccessToken } from "../utils/token.js";
function requireLogin(req, res, next) {
  const authorization = req.get("Authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);
  if (!match) {
    return res.status(401).json({
      message: "Vui lòng đăng nhập để tiếp tục",
      code: "AUTH_REQUIRED",
    });
  }

  const token = match[1];
  try {
    const payload = verifyAccessToken(token);
    if (
      payload === null ||
      typeof payload !== "object" ||
      Array.isArray(payload) ||
      typeof payload.sub !== "string" ||
      !/^[1-9]\d*$/.test(payload.sub)
    ) {
      return res.status(401).json({
        message: "Token không hợp lệ",
        code: "INVALID_TOKEN",
      });
    }
    req.auth = {
      userId: payload.sub,
    };
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token đã hết hạn",
        code: "ACCESS_TOKEN_EXPIRED",
      });
    }

    if (error.name === "JsonWebTokenError" || error.name === "NotBeforeError") {
      return res.status(401).json({
        message: "Token không hợp lệ",
        code: "INVALID_TOKEN",
      });
    }

    return next(error);
  }

  next();
}

export default requireLogin;
