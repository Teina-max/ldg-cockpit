import { test, expect } from "bun:test";
import { resolveToken } from "../src/mcp/auth";

const env = { MCP_TOKEN_TEINA: "tk-teina", MCP_TOKEN_BALLA: "tk-balla", MCP_TOKEN_YOUNES: "tk-younes" };

test("resolves teina token as editor", () => {
  expect(resolveToken("Bearer tk-teina", env)).toEqual({ user: "teina", role: "editor" });
});

test("resolves balla token as member (no Bearer prefix tolerated)", () => {
  expect(resolveToken("tk-balla", env)).toEqual({ user: "balla", role: "member" });
});

test("resolves younes token as member", () => {
  expect(resolveToken("Bearer tk-younes", env)).toEqual({ user: "younes", role: "member" });
});

test("rejects unknown / missing", () => {
  expect(resolveToken("Bearer nope", env)).toBeNull();
  expect(resolveToken(undefined, env)).toBeNull();
  expect(resolveToken("", env)).toBeNull();
});
