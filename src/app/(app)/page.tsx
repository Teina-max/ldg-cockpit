import { db } from "@/db";
import { projects } from "@/db/schema";
import { ProjectCard } from "@/components/project-card";

const GROUPS: { key: "prod" | "build" | "cadrage"; label: string }[] = [
  { key: "prod", label: "En prod / livré (attente client)" },
  { key: "build", label: "Build en cours" },
  { key: "cadrage", label: "Cadrage / Phase 0" },
];

export default async function Dashboard() {
  const rows = await db.select().from(projects);
  return (
    <div className="flex flex-col gap-6">
      {GROUPS.map((g) => {
        const list = rows.filter((r) => r.group === g.key);
        if (!list.length) return null;
        return (
          <section key={g.key}>
            <h2 className="mb-2 text-sm font-semibold uppercase text-neutral-500">{g.label}</h2>
            <div className="grid gap-2">
              {list.map((p) => <ProjectCard key={p.slug} p={p} />)}
            </div>
          </section>
        );
      })}
    </div>
  );
}
