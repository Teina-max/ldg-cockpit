type ReportProject = {
  id: number;
  nom: string;
  group: "prod" | "build" | "cadrage";
  phase: string;
  avancement: string;
  bloquant: string;
};
type ReportTask = { projectId: number };

const GROUPS: { key: "prod" | "build" | "cadrage"; label: string }[] = [
  { key: "prod", label: "En prod / livré" },
  { key: "build", label: "Build en cours" },
  { key: "cadrage", label: "Cadrage / Phase 0" },
];

// Pure: builds the digest email from already-fetched projects + pending tasks.
export function buildReport(projects: ReportProject[], pending: ReportTask[]): { subject: string; body: string } {
  const countByProject = new Map<number, number>();
  for (const t of pending) countByProject.set(t.projectId, (countByProject.get(t.projectId) ?? 0) + 1);

  const lines: string[] = ["Reporting projets LDG", ""];
  for (const g of GROUPS) {
    const list = projects.filter((p) => p.group === g.key);
    if (!list.length) continue;
    lines.push(`## ${g.label}`);
    for (const p of list) {
      lines.push(`- ${p.nom} — ${p.phase} (${p.avancement})`);
      if (p.bloquant) lines.push(`  Bloquant : ${p.bloquant}`);
      lines.push(`  Inputs en attente : ${countByProject.get(p.id) ?? 0}`);
    }
    lines.push("");
  }

  return {
    subject: `[LDG Cockpit] Reporting projets — ${projects.length} projets, ${pending.length} inputs en attente`,
    body: lines.join("\n"),
  };
}
