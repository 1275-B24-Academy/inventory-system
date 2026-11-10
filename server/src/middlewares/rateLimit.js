const { rateLimit } = require("express-rate-limit");

const commonOptions = {
  standardHeaders: "draft-8",
  legacyHeaders: false,
  // Tests may exercise authentication repeatedly without consuming quotas.
  skip: () => process.env.NODE_ENV === "test",
  handler: (_req, res) =>
    res.status(429).json({
      message: "Too many requests. Please try again later.",
      code: "TOO_MANY_REQUESTS",
    }),
};

const loginLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  identifier: "auth-login",
});

const registerLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  identifier: "auth-register",
});

module.exports = { loginLimiter, registerLimiter };
