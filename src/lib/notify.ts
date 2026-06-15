export type NotifyEvent = { type: string; actor: "teina" | "balla"; summary: string };
export type Notification = { destinataire: "teina" | "balla"; message: string };

export function buildNotification(e: NotifyEvent): Notification {
  // recipient is the OTHER party from the actor
  const destinataire = e.actor === "teina" ? "balla" : "teina";
  return { destinataire, message: e.summary };
}

export async function postToN8n(e: NotifyEvent): Promise<void> {
  const url = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return; // no-op if not configured (dev)
  const payload = buildNotification(e);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": secret },
      body: JSON.stringify({ ...payload, type: e.type }),
      signal: AbortSignal.timeout(5000), // never let a hanging n8n block the mutation
    });
  } catch (err) {
    console.error("n8n notify failed", err); // fail-soft: never block the mutation
  }
}
