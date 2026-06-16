import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { and, eq } from "drizzle-orm";
import { db } from "../../db";
import { projects, tasks } from "../../db/schema";
import { parseTracking } from "./parse-tracking";

const HUB = process.env.LDG_HUB_PROJETS ?? join(process.env.HOME!, "projects/ldg-hub/projets");

const LOCAL_HOSTS = ["localhost", "127.0.0.1", "::1", "0.0.0.0"];

// The shared cockpit that Balla/Younes read lives on a remote Postgres. A seed
// accidentally pointed at localhost writes to a throwaway local DB and silently
// fails to sync the team — so refuse a local target unless it's opted in explicitly.
function assertSeedTarget(): void {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("✗ DATABASE_URL manquant — seed refusé.");
    process.exit(1);
  }
  let host: string;
  try {
    host = new URL(url).hostname;
  } catch {
    console.error("✗ DATABASE_URL illisible — seed refusé.");
    process.exit(1);
  }
  const isLocal = LOCAL_HOSTS.includes(host);
  if (isLocal && process.env.SEED_ALLOW_LOCALHOST !== "1") {
    console.error(
      `✗ DATABASE_URL pointe sur '${host}' (local) — seed refusé par défaut.\n` +
        "  → PROD : fournir l'URL Postgres prod (hôte distant). Non joignable depuis le poste → lancer le seed côté serveur (réseau Coolify).\n" +
        "  → LOCAL volontaire : relancer avec SEED_ALLOW_LOCALHOST=1.",
    );
    process.exit(1);
  }
  console.log(`→ seed cible : ${isLocal ? "LOCAL" : "REMOTE"} (host=${host})`);
}

async function main() {
  assertSeedTarget();
  const files = readdirSync(HUB).filter((f) => f.endsWith(".md"));
  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    const md = readFileSync(join(HUB, file), "utf8"); // follows symlink
    const { project, tasks: parsedTasks } = parseTracking(md, slug);

    const existing = await db.select().from(projects).where(eq(projects.slug, slug));
    let projectId: number;
    if (existing.length) {
      projectId = existing[0].id;
      await db.update(projects).set({ ...project, lastUpdate: new Date() }).where(eq(projects.id, projectId));
    } else {
      const [row] = await db.insert(projects).values(project).returning({ id: projects.id });
      projectId = row.id;
    }

    // idempotent re-seed: replace only input_client tasks, keep ad_hoc tasks
    await db.delete(tasks).where(and(eq(tasks.projectId, projectId), eq(tasks.origin, "input_client")));
    if (parsedTasks.length) {
      await db.insert(tasks).values(parsedTasks.map((t) => ({ ...t, projectId })));
    }
    console.log(`seeded ${slug}: ${parsedTasks.length} tasks`);
  }
  process.exit(0);
}

main();
