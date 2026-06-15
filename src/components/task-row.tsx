"use client";
import { toggleTask } from "@/actions/tasks";

type T = {
  id: number;
  title: string;
  quiFournit: string;
  depuis: string;
  status: "todo" | "done";
  origin: string;
};

export function TaskRow({ t, canToggle }: { t: T; canToggle: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded border p-2 text-sm">
      <input
        type="checkbox"
        disabled={!canToggle}
        defaultChecked={t.status === "done"}
        onChange={(e) => toggleTask(t.id, e.target.checked)}
      />
      <span className={t.status === "done" ? "text-neutral-400 line-through" : ""}>{t.title}</span>
      {t.quiFournit && <span className="text-neutral-500">· {t.quiFournit}</span>}
      {t.depuis && <span className="ml-auto text-neutral-400">depuis {t.depuis}</span>}
    </div>
  );
}
