"use server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { auth } from "@/lib/auth";
import { roleFor } from "@/lib/access";
import { createEvent } from "@/lib/events";
import { postToN8n } from "@/lib/notify";

export async function toggleTask(taskId: number, done: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Non autorisé");

  const [t] = await db.select().from(tasks).where(eq(tasks.id, taskId));
  if (!t) throw new Error("Tâche introuvable");
  const [p] = await db.select().from(projects).where(eq(projects.id, t.projectId));

  await db.update(tasks)
    .set({ status: done ? "done" : "todo", doneAt: done ? new Date() : null })
    .where(eq(tasks.id, taskId));

  if (done && t.leveBloquant) {
    await db.update(projects).set({ bloquant: "", lastUpdate: new Date() }).where(eq(projects.id, p.id));
  }
  if (done) {
    const summary = await createEvent({
      type: "task_done", actor: "balla", projectNom: p.nom, detail: t.title, projectId: p.id, taskId,
    });
    await postToN8n({ type: "task_done", actor: "balla", summary });
  }

  revalidatePath("/mes-taches");
  revalidatePath(`/projets/${p.slug}`);
}

export async function createTask(projectId: number, title: string, detail: string, leveBloquant: boolean) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || roleFor(session.user.email) !== "teina") throw new Error("Non autorisé");

  const [p] = await db.select().from(projects).where(eq(projects.id, projectId));
  const [row] = await db.insert(tasks)
    .values({ projectId, owner: "balla", origin: "ad_hoc", title, detail, leveBloquant })
    .returning({ id: tasks.id });

  const summary = await createEvent({
    type: "task_added", actor: "teina", projectNom: p.nom, detail: title, projectId, taskId: row.id,
  });
  await postToN8n({ type: "task_added", actor: "teina", summary });

  revalidatePath("/mes-taches");
  revalidatePath(`/projets/${p.slug}`);
}
