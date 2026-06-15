export const dynamic = "force-dynamic";

// Lightweight liveness endpoint for Coolify healthcheck — no DB, always 200.
export function GET() {
  return new Response("ok", { status: 200 });
}
