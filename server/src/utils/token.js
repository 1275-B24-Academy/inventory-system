const jwt = require("jsonwebtoken");

function createAccessToken(userId) {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("Thiếu JWT_ACCESS_SECRET");
  }

  return jwt.sign(
    { sub: String(userId) },
    secret,

    // Cấu hình token.
    {
      algorithm: "HS256",
      expiresIn: "15m",
      issuer: "inventory-server",
      audience: "inventory-api"
    }
  );
}
function verifyAccessToken(token) {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("Thiếu JWT_ACCESS_SECRET");
  }

  return jwt.verify(token, secret, {
    algorithms: ["HS256"],
    issuer: "inventory-server",
    audience: "inventory-api"
  });
}

module.exports = { createAccessToken, verifyAccessToken };