export type NotifyEvent = { type: string; actor: "teina" | "balla"; summary: string };
export type Notification = { destinataire: "teina" | "balla"; message: string };

export function buildNotification(e: NotifyEvent): Notification {
  // recipient is the OTHER party from the actor
  const destinataire = e.actor === "teina" ? "balla" : "teina";
  return { destinataire, message: e.summary };
}

export function emailForUser(user: "teina" | "balla"): string | undefined {
  return user === "teina" ? process.env.EMAIL_TEINA : process.env.EMAIL_BALLA;
}

const SUBJECTS: Record<string, string> = {
  status_changed: "Statut projet mis à jour",
  bloquant_changed: "Bloquant projet",
  task_added: "Nouvelle tâche",
  task_done: "Tâche faite",
  message: "Nouveau message",
};

async function post(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.N8N_WEBHOOK_URL;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!url || !secret) return; // no-op until configured
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-webhook-secret": secret },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000), // never let a hanging n8n block the mutation
    });
  } catch (err) {
    console.error("n8n notify failed", err); // fail-soft
  }
}

// Event → email to the OTHER party.
export async function postToN8n(e: NotifyEvent): Promise<void> {
  const { destinataire } = buildNotification(e);
  const to = emailForUser(destinataire);
  if (!to) return;
  await post({ type: e.type, to_email: to, subject: `[LDG Cockpit] ${SUBJECTS[e.type] ?? "Notification"}`, body: e.summary });
}

// Arbitrary email (used by email_report).
export async function sendMail(toEmail: string, subject: string, body: string): Promise<void> {
  await post({ type: "report", to_email: toEmail, subject, body });
}
