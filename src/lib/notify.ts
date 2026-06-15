import type { User } from "./users";

// `to` is the explicit recipient — callers decide who gets notified (no "other party" guess,
// which is undefined once there are 3+ identities).
export type NotifyEvent = { type: string; actor: User; to: User; summary: string };
export type Notification = { destinataire: User; message: string };

export function buildNotification(e: NotifyEvent): Notification {
  return { destinataire: e.to, message: e.summary };
}

export function emailForUser(user: User): string | undefined {
  const map: Record<User, string | undefined> = {
    teina: process.env.EMAIL_TEINA,
    balla: process.env.EMAIL_BALLA,
    younes: process.env.EMAIL_YOUNES,
  };
  return map[user];
}

function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
  const body = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px">${escHtml(e.summary)}</div>`;
  await post({ type: e.type, to_email: to, subject: `[LDG Cockpit] ${SUBJECTS[e.type] ?? "Notification"}`, body });
}

// Arbitrary email (used by email_report).
export async function sendMail(toEmail: string, subject: string, body: string): Promise<void> {
  await post({ type: "report", to_email: toEmail, subject, body });
}
