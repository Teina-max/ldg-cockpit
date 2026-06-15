"use server";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { auth } from "@/lib/auth";
import { roleFor } from "@/lib/access";
import { createEvent } from "@/lib/events";
import { postToN8n } from "@/lib/notify";

export async function updateProject(
  slug: string,
  form: { phase: string; avancement: string; bloquant: string; statutDetail: string; nextActionTeina: string },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || roleFor(session.user.email) !== "teina") throw new Error("Non autorisé");

  const [before] = await db.select().from(projects).where(eq(projects.slug, slug));
  if (!before) throw new Error("Projet introuvable");

  await db.update(projects).set({ ...form, lastUpdate: new Date() }).where(eq(projects.slug, slug));

  if (before.bloquant !== form.bloquant) {
    const summary = await createEvent({
      type: "bloquant_changed", actor: "teina", projectNom: before.nom,
      detail: form.bloquant || "levé", projectId: before.id,
    });
    await postToN8n({ type: "bloquant_changed", actor: "teina", to: "balla", summary });
  } else if (before.phase !== form.phase || before.avancement !== form.avancement) {
    const summary = await createEvent({
      type: "status_changed", actor: "teina", projectNom: before.nom,
      detail: `${form.phase} — ${form.avancement}`, projectId: before.id,
    });
    await postToN8n({ type: "status_changed", actor: "teina", to: "balla", summary });
  }

  revalidatePath(`/projets/${slug}`);
  revalidatePath("/");
}
