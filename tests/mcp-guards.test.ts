import { test, expect } from "bun:test";
import { assertRole, RoleError } from "../src/mcp/guards";

test("assertRole passes for matching role", () => {
  expect(() => assertRole("teina", "teina")).not.toThrow();
});

test("assertRole throws RoleError for wrong role", () => {
  expect(() => assertRole("balla", "teina")).toThrow(RoleError);
});
