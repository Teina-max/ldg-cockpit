import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { projects, tasks } from "../../db/schema";
import { parseTracking } from "./parse-tracking";

const HUB = process.env.LDG_HUB_PROJETS ?? join(process.env.HOME!, "projects/ldg-hub/projets");

async function main() {
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
    await db.delete(tasks).where(eq(tasks.projectId, projectId));
    if (parsedTasks.length) {
      await db.insert(tasks).values(parsedTasks.map((t) => ({ ...t, projectId })));
    }
    console.log(`seeded ${slug}: ${parsedTasks.length} tasks`);
  }
  process.exit(0);
}

main();
