import { test, expect } from "bun:test";
import { assertRole, RoleError } from "../src/mcp/guards";

test("assertRole passes for matching role", () => {
  expect(() => assertRole("editor", "editor")).not.toThrow();
  expect(() => assertRole("member", "member")).not.toThrow();
});

test("assertRole throws RoleError when a member attempts an editor action", () => {
  expect(() => assertRole("member", "editor")).toThrow(RoleError);
});

test("assertRole throws RoleError when an editor attempts a member action", () => {
  expect(() => assertRole("editor", "member")).toThrow(RoleError);
});
