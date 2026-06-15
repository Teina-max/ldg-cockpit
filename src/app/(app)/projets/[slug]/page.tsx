import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { auth } from "@/lib/auth";
import { roleFor } from "@/lib/access";
import { ProjectEditForm } from "@/components/project-edit-form";
import { TaskRow } from "@/components/task-row";

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  const role = roleFor(session!.user.email);
  const [p] = await db.select().from(projects).where(eq(projects.slug, slug));
  if (!p) return <p>Projet introuvable.</p>;
  const taskList = await db.select().from(tasks).where(eq(tasks.projectId, p.id));

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">{p.nom}</h1>
      <p className="text-sm text-neutral-600">{p.client} · {p.via}</p>
      {role === "teina" ? (
        <ProjectEditForm
          p={{
            slug: p.slug, phase: p.phase, avancement: p.avancement,
            bloquant: p.bloquant, statutDetail: p.statutDetail, nextActionTeina: p.nextActionTeina,
          }}
        />
      ) : (
        <div className="rounded border p-3 text-sm">
          <p><b>Phase :</b> {p.phase} — {p.avancement}</p>
          {p.bloquant && <p className="text-amber-700">⚠ {p.bloquant}</p>}
          <p className="mt-1 whitespace-pre-wrap">{p.statutDetail}</p>
        </div>
      )}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase text-neutral-500">Inputs / tâches</h2>
        <div className="flex flex-col gap-1">
          {taskList.map((t) => <TaskRow key={t.id} t={t} canToggle={role === "balla"} />)}
        </div>
      </section>
    </div>
  );
}
