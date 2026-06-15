import { test, expect } from "bun:test";
import { summarize } from "../src/lib/events";

test("summarize status change", () => {
  expect(
    summarize({ type: "status_changed", actor: "teina", projectNom: "ILLIG France", detail: "Phase 1 → livrée" }),
  ).toBe("ILLIG France : statut mis à jour — Phase 1 → livrée");
});

test("summarize task done", () => {
  expect(
    summarize({ type: "task_done", actor: "balla", projectNom: "ILLIG France", detail: "Credential Outlook OAuth2" }),
  ).toBe("ILLIG France : tâche faite par Balla — Credential Outlook OAuth2");
});
