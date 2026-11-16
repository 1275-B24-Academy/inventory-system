import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import validate from "../../src/middlewares/validate.js";

const body = z.object({ qty: z.coerce.number().int().positive() });
const params = z.object({ id: z.coerce.number().int().positive() });

describe("validate middleware", () => {
  it("stores parsed data in req.validated and calls next()", () => {
    const req = { body: { qty: "3" }, params: { id: "7" } };
    const next = vi.fn();

    validate({ body, params })(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.validated).toEqual({ body: { qty: 3 }, params: { id: 7 } });
    // Không ghi đè req.body: Express 5 không cho ghi đè req.query nên ta thống nhất không ghi đè gì cả.
    expect(req.body).toEqual({ qty: "3" });
  });

  it("passes a 400 error with details to next()", () => {
    const req = { body: { qty: -1 }, params: { id: "abc" } };
    const next = vi.fn();

    validate({ body, params })(req, {}, next);

    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
    expect(error.message).toBe(error.details[0].message);
    expect(error.details.map((d) => `${d.in}:${d.path}`)).toEqual([
      "params:id",
      "body:qty",
    ]);
    expect(req.validated).toBeUndefined();
  });

  it("treats a missing body as an empty object", () => {
    const next = vi.fn();

    validate({ body })({}, {}, next);

    expect(next.mock.calls[0][0].statusCode).toBe(400);
  });
});
