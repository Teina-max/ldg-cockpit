import { test, expect } from "bun:test";
import { buildReport } from "../src/mcp/report";

test("buildReport groups projects + counts pending inputs", () => {
  const projects = [
    { id: 1, nom: "Alpha", group: "prod" as const, phase: "Prod", avancement: "100%", bloquant: "" },
    { id: 2, nom: "Beta", group: "build" as const, phase: "Build", avancement: "50%", bloquant: "X manquant" },
  ];
  const pending = [{ projectId: 2 }, { projectId: 2 }, { projectId: 1 }];
  const r = buildReport(projects, pending);
  expect(r.subject).toContain("2 projets");
  expect(r.subject).toContain("3 inputs");
  expect(r.body).toContain("En prod / livré");
  expect(r.body).toContain("Alpha");
  expect(r.body).toContain("Bloquant : X manquant");
  expect(r.body).toContain("Inputs en attente : 2");
});
