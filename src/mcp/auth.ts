export type Identity = { user: "teina" | "balla"; role: "teina" | "balla" };

export function resolveToken(
  authHeader: string | undefined,
  env: Record<string, string | undefined> = process.env,
): Identity | null {
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();
  if (!token) return null;
  if (env.MCP_TOKEN_TEINA && token === env.MCP_TOKEN_TEINA) return { user: "teina", role: "teina" };
  if (env.MCP_TOKEN_BALLA && token === env.MCP_TOKEN_BALLA) return { user: "balla", role: "balla" };
  return null;
}
