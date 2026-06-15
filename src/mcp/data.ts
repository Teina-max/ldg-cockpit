import { and, eq, ilike, or, isNull } from "drizzle-orm";
import { db } from "@/db";
import { projects, tasks, messages } from "@/db/schema";
import { createEvent } from "@/lib/events";
import { postToN8n } from "@/lib/notify";

export async function listProjects() {
  return db.select().from(projects);
}

export async function getProject(slug: string) {
  const [p] = await db.select().from(projects).where(eq(projects.slug, slug));
  if (!p) return null;
  const t = await db.select().from(tasks).where(eq(tasks.projectId, p.id));
  return { project: p, tasks: t };
}

export async function pendingInputs(slug?: string) {
  if (slug) {
    const [p] = await db.select().from(projects).where(eq(projects.slug, slug));
    if (!p) return [];
    return db.select().from(tasks).where(and(eq(tasks.projectId, p.id), eq(tasks.status, "todo")));
  }
  return db.select().from(tasks).where(eq(tasks.status, "todo"));
}

export async function search(q: string) {
  const like = `%${q}%`;
  const proj = await db.select().from(projects)
    .where(or(ilike(projects.nom, like), ilike(projects.bloquant, like), ilike(projects.statutDetail, like)));
  const tk = await db.select().from(tasks)
    .where(or(ilike(tasks.title, like), ilike(tasks.detail, like)));
  return { projects: proj, tasks: tk };
}

export async function updateProject(
  slug: string,
  patch: { phase?: string; avancement?: string; bloquant?: string; statutDetail?: string; nextActionTeina?: string },
) {
  const [before] = await db.select().from(projects).where(eq(projects.slug, slug));
  if (!before) throw new Error("Projet introuvable");
  await db.update(projects).set({ ...patch, lastUpdate: new Date() }).where(eq(projects.slug, slug));
  if (patch.bloquant !== undefined && patch.bloquant !== before.bloquant) {
    const summary = await createEvent({ type: "bloquant_changed", actor: "teina", projectNom: before.nom, detail: patch.bloquant || "levé", projectId: before.id });
    await postToN8n({ type: "bloquant_changed", actor: "teina", summary });
  } else if ((patch.phase ?? before.phase) !== before.phase || (patch.avancement ?? before.avancement) !== before.avancement) {
    const summary = await createEvent({ type: "status_changed", actor: "teina", projectNom: before.nom, detail: `${patch.phase ?? before.phase} — ${patch.avancement ?? before.avancement}`, projectId: before.id });
    await postToN8n({ type: "status_changed", actor: "teina", summary });
  }
  return getProject(slug);
}

export async function addTask(slug: string, title: string, detail: string, leveBloquant: boolean) {
  const [p] = await db.select().from(projects).where(eq(projects.slug, slug));
  if (!p) throw new Error("Projet introuvable");
  const [row] = await db.insert(tasks).values({ projectId: p.id, owner: "balla", origin: "ad_hoc", title, detail, leveBloquant }).returning({ id: tasks.id });
  const summary = await createEvent({ type: "task_added", actor: "teina", projectNom: p.nom, detail: title, projectId: p.id, taskId: row.id });
  await postToN8n({ type: "task_added", actor: "teina", summary });
  return row.id;
}

export async function completeTask(taskId: number) {
  const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!t) throw new Error("Tâche introuvable");
  const [p] = await db.select().from(projects).where(eq(projects.id, t.projectId));
  if (!p) throw new Error("Projet introuvable");
  await db.update(tasks).set({ status: "done", doneAt: new Date() }).where(eq(tasks.id, taskId));
  await db.update(projects).set(t.leveBloquant ? { bloquant: "", lastUpdate: new Date() } : { lastUpdate: new Date() }).where(eq(projects.id, p.id));
  const summary = await createEvent({ type: "task_done", actor: "balla", projectNom: p.nom, detail: t.title, projectId: p.id, taskId });
  await postToN8n({ type: "task_done", actor: "balla", summary });
  return summary;
}

export async function sendMessage(from: "teina" | "balla", to: "teina" | "balla", text: string, slug?: string) {
  let projectId: number | null = null;
  if (slug) {
    const [p] = await db.select().from(projects).where(eq(projects.slug, slug));
    projectId = p?.id ?? null;
  }
  const [row] = await db.insert(messages).values({ fromUser: from, toUser: to, text, projectId }).returning({ id: messages.id });
  await postToN8n({ type: "message", actor: from, summary: `Message de ${from} → ${to} : ${text.slice(0, 120)}` });
  return row.id;
}

export async function inbox(user: "teina" | "balla", unreadOnly: boolean) {
  const cond = unreadOnly
    ? and(eq(messages.toUser, user), isNull(messages.readAt))
    : eq(messages.toUser, user);
  return db.select().from(messages).where(cond);
}

export async function markRead(id: number, user: "teina" | "balla") {
  await db.update(messages).set({ readAt: new Date() }).where(and(eq(messages.id, id), eq(messages.toUser, user)));
}
