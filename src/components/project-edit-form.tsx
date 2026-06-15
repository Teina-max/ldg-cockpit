"use client";
import { useState } from "react";
import { updateProject } from "@/actions/projects";

type P = {
  slug: string;
  phase: string;
  avancement: string;
  bloquant: string;
  statutDetail: string;
  nextActionTeina: string;
};

export function ProjectEditForm({ p }: { p: P }) {
  const [f, setF] = useState(p);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function field(k: keyof P) {
    return {
      value: f[k],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setF({ ...f, [k]: e.target.value });
        setSaved(false);
      },
    };
  }

  async function save() {
    setSaving(true);
    await updateProject(p.slug, {
      phase: f.phase, avancement: f.avancement, bloquant: f.bloquant,
      statutDetail: f.statutDetail, nextActionTeina: f.nextActionTeina,
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div className="flex flex-col gap-2 rounded border p-3">
      <label className="text-sm">Phase<input className="mt-1 w-full rounded border p-2" {...field("phase")} /></label>
      <label className="text-sm">Avancement<input className="mt-1 w-full rounded border p-2" {...field("avancement")} /></label>
      <label className="text-sm">Bloquant<input className="mt-1 w-full rounded border p-2" {...field("bloquant")} /></label>
      <label className="text-sm">Statut détaillé<textarea className="mt-1 w-full rounded border p-2" {...field("statutDetail")} /></label>
      <label className="text-sm">Prochaine action<input className="mt-1 w-full rounded border p-2" {...field("nextActionTeina")} /></label>
      <button onClick={save} disabled={saving} className="self-start rounded bg-black px-3 py-2 text-sm text-white disabled:opacity-50">
        {saving ? "Enregistrement…" : "Enregistrer"}
      </button>
      {saved && <span className="text-sm text-green-600">Enregistré (Balla notifié si changement significatif)</span>}
    </div>
  );
}
