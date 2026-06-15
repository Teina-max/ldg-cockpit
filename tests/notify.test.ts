import { test, expect } from "bun:test";
import { buildNotification, emailForUser } from "../src/lib/notify";

test("notification targets the explicit recipient (Balla when Teina advances)", () => {
  const n = buildNotification({ type: "status_changed", actor: "teina", to: "balla", summary: "X : statut mis à jour — ok" });
  expect(n.destinataire).toBe("balla");
  expect(n.message).toContain("X : statut mis à jour — ok");
});

test("notification targets Teina when Younes completes a task", () => {
  const n = buildNotification({ type: "task_done", actor: "younes", to: "teina", summary: "X : tâche faite par Younes — y" });
  expect(n.destinataire).toBe("teina");
});

test("emailForUser maps younes to EMAIL_YOUNES", () => {
  process.env.EMAIL_YOUNES = "younes@example.com";
  expect(emailForUser("younes")).toBe("younes@example.com");
});
