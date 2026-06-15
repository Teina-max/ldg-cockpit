import { test, expect } from "bun:test";
import { parseTracking } from "../src/lib/seed/parse-tracking";

const SAMPLE = `---
nom: Joli Jeune
client: Agnès (cures de jeûne)
via: LDG / La Dinguerie
phase: Prod
avancement: 97%
bloquant: Airtable non synchro séjours
next: Trier backlog
group: prod
last-update: 2026-06-15
---

# Joli Jeune — Tracking

## Statut
En prod.

<!-- INPUTS:START -->
## Inputs clients en attente
| # | Input attendu | Qui | Depuis | Relancé le | Débloque |
|---|---|---|---|---|---|
| 1 | Export séjours réels | Agnès | 2026-06-02 | — | Sync planning |
| 2 | Credentials Slack | Équipe JJ | 2026-05 | — | Error-hook |
<!-- INPUTS:END -->

## Prochaine action (Teina)
- [ ] Trier backlog
`;

test("parses frontmatter into a project", () => {
  const { project } = parseTracking(SAMPLE, "joli-jeune");
  expect(project.slug).toBe("joli-jeune");
  expect(project.nom).toBe("Joli Jeune");
  expect(project.group).toBe("prod");
  expect(project.avancement).toBe("97%");
  expect(project.bloquant).toBe("Airtable non synchro séjours");
  expect(project.nextActionTeina).toBe("Trier backlog");
});

test("parses INPUTS rows into balla tasks", () => {
  const { tasks } = parseTracking(SAMPLE, "joli-jeune");
  expect(tasks).toHaveLength(2);
  expect(tasks[0]).toMatchObject({
    owner: "balla",
    origin: "input_client",
    status: "todo",
    title: "Export séjours réels",
    quiFournit: "Agnès",
    depuis: "2026-06-02",
  });
  expect(tasks[1].title).toBe("Credentials Slack");
});
