import { createHash, timingSafeEqual } from "node:crypto";
import type { User, Role } from "../lib/users";

export type Identity = { user: User; role: Role };

// token env var → identity. Adding a collaborator = one more line + one more token.
const TOKENS: { env: string; identity: Identity }[] = [
  { env: "MCP_TOKEN_TEINA", identity: { user: "teina", role: "editor" } },
  { env: "MCP_TOKEN_BALLA", identity: { user: "balla", role: "member" } },
  { env: "MCP_TOKEN_YOUNES", identity: { user: "younes", role: "member" } },
];

// Constant-time compare via fixed-length SHA-256 digests (no length leak, no early exit).
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(createHash("sha256").update(a).digest(), createHash("sha256").update(b).digest());
}

export function resolveToken(
  authHeader: string | undefined,
  env: Record<string, string | undefined> = process.env,
): Identity | null {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  // Check every token without an early return to avoid an identity timing channel.
  let result: Identity | null = null;
  for (const { env: name, identity } of TOKENS) {
    const expected = env[name];
    if (expected && safeEqual(token, expected)) result = identity;
  }
  return result;
}
