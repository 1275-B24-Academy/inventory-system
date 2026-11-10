const assert = require("node:assert/strict");
const { once } = require("node:events");
const test = require("node:test");
const express = require("express");
const {
  loginLimiter,
  registerLimiter,
} = require("../src/middlewares/rateLimit");

async function withServer(app, fn) {
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn(base);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  }
}

test("helmet sets security headers on the actual app", async () => {
  const app = require("../src/app");
  await withServer(app, async (base) => {
    const response = await fetch(`${base}/missing`);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    assert.match(
      response.headers.get("content-security-policy"),
      /default-src/,
    );
  });
});

test("only login and register are protected by the auth rate limiters", () => {
  const router = require("../src/routes/auth.routes");
  const middlewaresByRoute = new Map(
    router.stack
      .filter((layer) => layer.route)
      .map((layer) => [layer.route.path, layer.route.stack.length]),
  );
  assert.equal(middlewaresByRoute.get("/login"), 2);
  assert.equal(middlewaresByRoute.get("/register"), 2);
  assert.equal(middlewaresByRoute.get("/refresh"), 1);
});

test("login blocks request 11 and register blocks request 6 with JSON 429", async () => {
  const app = express();
  app.post("/login", loginLimiter, (_req, res) =>
    res.status(401).json({ message: "invalid" }),
  );
  app.post("/register", registerLimiter, (_req, res) =>
    res.status(201).json({ message: "ok" }),
  );
  app.post("/refresh", (_req, res) => res.json({ message: "ok" }));

  await withServer(app, async (base) => {
    for (let i = 0; i < 10; i += 1) {
      assert.equal(
        (await fetch(`${base}/login`, { method: "POST" })).status,
        401,
      );
    }
    const loginBlocked = await fetch(`${base}/login`, { method: "POST" });
    assert.equal(loginBlocked.status, 429);
    assert.equal((await loginBlocked.json()).code, "TOO_MANY_REQUESTS");

    for (let i = 0; i < 5; i += 1) {
      assert.equal(
        (await fetch(`${base}/register`, { method: "POST" })).status,
        201,
      );
    }
    const registerBlocked = await fetch(`${base}/register`, { method: "POST" });
    assert.equal(registerBlocked.status, 429);
    assert.equal((await registerBlocked.json()).code, "TOO_MANY_REQUESTS");

    for (let i = 0; i < 12; i += 1) {
      assert.equal(
        (await fetch(`${base}/refresh`, { method: "POST" })).status,
        200,
      );
    }
  });
});

test("NODE_ENV=test bypasses the quota", async () => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
  try {
    const app = express();
    app.post("/login", loginLimiter, (_req, res) => res.sendStatus(204));
    await withServer(app, async (base) => {
      for (let i = 0; i < 12; i += 1) {
        assert.equal(
          (await fetch(`${base}/login`, { method: "POST" })).status,
          204,
        );
      }
    });
  } finally {
    if (previous === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previous;
  }
});
