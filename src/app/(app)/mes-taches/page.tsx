import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { TaskRow } from "@/components/task-row";

export default async function MesTaches() {
  const rows = await db
    .select({
      id: tasks.id, title: tasks.title, quiFournit: tasks.quiFournit, depuis: tasks.depuis,
      status: tasks.status, origin: tasks.origin, projectNom: projects.nom,
    })
    .from(tasks)
    .innerJoin(projects, eq(tasks.projectId, projects.id))
    .where(and(eq(tasks.owner, "balla"), eq(tasks.status, "todo")));

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-xl font-semibold">Mes tâches</h1>
      {rows.map((t) => (
        <div key={t.id}>
          <p className="text-xs uppercase text-neutral-400">{t.projectNom}</p>
          <TaskRow t={t} canToggle />
        </div>
      ))}
      {!rows.length && <p className="text-sm text-neutral-500">Aucune tâche en attente.</p>}
    </div>
  );
}
