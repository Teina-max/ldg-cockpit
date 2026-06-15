import { test, expect } from "bun:test";
import { resolveToken } from "../src/mcp/auth";

const env = { MCP_TOKEN_TEINA: "tk-teina", MCP_TOKEN_BALLA: "tk-balla" };

test("resolves teina token", () => {
  expect(resolveToken("Bearer tk-teina", env)).toEqual({ user: "teina", role: "teina" });
});

test("resolves balla token (no Bearer prefix tolerated)", () => {
  expect(resolveToken("tk-balla", env)).toEqual({ user: "balla", role: "balla" });
});

test("rejects unknown / missing", () => {
  expect(resolveToken("Bearer nope", env)).toBeNull();
  expect(resolveToken(undefined, env)).toBeNull();
  expect(resolveToken("", env)).toBeNull();
});
