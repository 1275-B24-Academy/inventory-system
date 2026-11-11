import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { app, createUser, prisma, resetDb } from "./helpers.js";

describe("POST /api/auth/login", () => {
  beforeEach(resetDb);

  it("returns accessToken and sets refresh token cookie", async () => {
    const user = await createUser();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.headers["set-cookie"][0]).toMatch(/^refreshToken=.*HttpOnly/);
    // Refresh token được lưu (dạng hash) trong DB thật.
    expect(await prisma.refreshToken.count()).toBe(1);
  });

  it("rejects wrong password with 401", async () => {
    const user = await createUser();

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "wrong-password" });

    expect(res.status).toBe(401);
  });

  it("rejects locked account with 403", async () => {
    const user = await createUser({ status: "locked" });

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: user.password });

    expect(res.status).toBe(403);
  });
});
