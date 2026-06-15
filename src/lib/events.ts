import { db } from "../db";
import { events } from "../db/schema";

export type EventInput = {
  type: "status_changed" | "bloquant_changed" | "task_added" | "task_done";
  actor: "teina" | "balla";
  projectNom: string;
  detail: string;
  projectId?: number;
  taskId?: number;
};

export function summarize(e: Pick<EventInput, "type" | "actor" | "projectNom" | "detail">): string {
  const who = e.actor === "balla" ? "Balla" : "Teina";
  switch (e.type) {
    case "status_changed":
      return `${e.projectNom} : statut mis à jour — ${e.detail}`;
    case "bloquant_changed":
      return `${e.projectNom} : bloquant — ${e.detail}`;
    case "task_added":
      return `${e.projectNom} : nouvelle tâche (${who}) — ${e.detail}`;
    case "task_done":
      return `${e.projectNom} : tâche faite par ${who} — ${e.detail}`;
  }
}

export async function createEvent(e: EventInput): Promise<string> {
  const summary = summarize(e);
  await db.insert(events).values({
    projectId: e.projectId ?? null,
    taskId: e.taskId ?? null,
    type: e.type,
    actor: e.actor,
    summary,
  });
  return summary;
}
