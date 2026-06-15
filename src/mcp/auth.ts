import { createHash, timingSafeEqual } from "node:crypto";

export type Identity = { user: "teina" | "balla"; role: "teina" | "balla" };

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
  // Check both tokens without an early return to avoid an identity timing channel.
  let result: Identity | null = null;
  if (env.MCP_TOKEN_TEINA && safeEqual(token, env.MCP_TOKEN_TEINA)) result = { user: "teina", role: "teina" };
  if (env.MCP_TOKEN_BALLA && safeEqual(token, env.MCP_TOKEN_BALLA)) result = { user: "balla", role: "balla" };
  return result;
}
