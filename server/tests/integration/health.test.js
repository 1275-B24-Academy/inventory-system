import request from "supertest";
import { describe, expect, it } from "vitest";
import { app } from "./helpers.js";

describe("app basics", () => {
  it("GET /health returns ok", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("returns JSON 404 for unknown API route", async () => {
    const res = await request(app).get("/api/does-not-exist");

    expect(res.status).toBe(404);
    expect(res.headers["content-type"]).toMatch(/json/);
  });
});
