export type ParsedProject = {
  slug: string;
  nom: string;
  client: string;
  via: string;
  group: "prod" | "build" | "cadrage";
  phase: string;
  avancement: string;
  bloquant: string;
  nextActionTeina: string;
};

export type ParsedTask = {
  owner: "balla";
  origin: "input_client";
  status: "todo";
  title: string;
  quiFournit: string;
  depuis: string;
  relanceLe: string;
  detail: string;
};

function frontmatter(md: string): Record<string, string> {
  const m = md.match(/^---\n([\s\S]*?)\n---/);
  const out: Record<string, string> = {};
  if (!m) return out;
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

function cell(row: string, idx: number): string {
  // split a markdown table row "| a | b |" into trimmed cells
  const parts = row.split("|").slice(1, -1).map((s) => s.trim());
  return parts[idx] ?? "";
}

export function parseTracking(md: string, slug: string): { project: ParsedProject; tasks: ParsedTask[] } {
  const fm = frontmatter(md);
  const group = (["prod", "build", "cadrage"].includes(fm.group) ? fm.group : "build") as ParsedProject["group"];
  const project: ParsedProject = {
    slug,
    nom: fm.nom ?? slug,
    client: fm.client ?? "",
    via: fm.via ?? "LDG / La Dinguerie",
    group,
    phase: fm.phase ?? "",
    avancement: fm.avancement ?? "",
    bloquant: fm.bloquant ?? "",
    nextActionTeina: fm.next ?? "",
  };

  const tasks: ParsedTask[] = [];
  const block = md.match(/<!-- INPUTS:START -->([\s\S]*?)<!-- INPUTS:END -->/);
  if (block) {
    for (const row of block[1].split("\n")) {
      const r = row.trim();
      if (!r.startsWith("|")) continue;
      if (/^\|\s*#/.test(r)) continue; // header row
      if (/^\|\s*-/.test(r)) continue; // separator row
      const title = cell(r, 1);
      if (!title || title === "—") continue;
      tasks.push({
        owner: "balla",
        origin: "input_client",
        status: "todo",
        title,
        quiFournit: cell(r, 2),
        depuis: cell(r, 3),
        relanceLe: cell(r, 4),
        detail: cell(r, 5),
      });
    }
  }
  return { project, tasks };
}
