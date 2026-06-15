import { test, expect } from "bun:test";
import { buildNotification } from "../src/lib/notify";

test("notify Balla when Teina advances", () => {
  const n = buildNotification({ type: "status_changed", actor: "teina", summary: "X : statut mis à jour — ok" });
  expect(n.destinataire).toBe("balla");
  expect(n.message).toContain("X : statut mis à jour — ok");
});

test("notify Teina when Balla completes a task", () => {
  const n = buildNotification({ type: "task_done", actor: "balla", summary: "X : tâche faite par Balla — y" });
  expect(n.destinataire).toBe("teina");
});
