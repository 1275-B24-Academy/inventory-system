import crypto from "node:crypto";

function createRefreshToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashRefreshToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export { createRefreshToken, hashRefreshToken };
