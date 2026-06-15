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

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Pure: builds the HTML digest email from already-fetched projects + pending tasks.
export function buildReport(projects: ReportProject[], pending: ReportTask[]): { subject: string; body: string } {
  const countByProject = new Map<number, number>();
  for (const t of pending) countByProject.set(t.projectId, (countByProject.get(t.projectId) ?? 0) + 1);

  const parts: string[] = [
    '<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:14px;color:#1a1a1a">',
    "<h2 style=\"margin:0 0 4px\">Reporting projets LDG</h2>",
    `<p style="color:#666;margin:0 0 16px">${projects.length} projets · ${pending.length} inputs en attente</p>`,
  ];
  for (const g of GROUPS) {
    const list = projects.filter((p) => p.group === g.key);
    if (!list.length) continue;
    parts.push(`<h3 style="margin:16px 0 6px;border-bottom:1px solid #eee;padding-bottom:4px">${g.label}</h3>`);
    parts.push('<ul style="margin:0;padding-left:18px">');
    for (const p of list) {
      const n = countByProject.get(p.id) ?? 0;
      let li = `<li style="margin-bottom:8px"><strong>${esc(p.nom)}</strong> — ${esc(p.phase)} (${esc(p.avancement)})`;
      if (p.bloquant) li += `<br><span style="color:#b45309">⚠ Bloquant : ${esc(p.bloquant)}</span>`;
      li += `<br><span style="color:#666">Inputs en attente : ${n}</span></li>`;
      parts.push(li);
    }
    parts.push("</ul>");
  }
  parts.push("</div>");

  return {
    subject: `[LDG Cockpit] Reporting projets — ${projects.length} projets, ${pending.length} inputs en attente`,
    body: parts.join(""),
  };
}
