import Link from "next/link";

type P = { slug: string; nom: string; phase: string; avancement: string; bloquant: string };

export function ProjectCard({ p }: { p: P }) {
  return (
    <Link href={`/projets/${p.slug}`} className="block rounded border p-3 hover:bg-neutral-50">
      <div className="flex justify-between">
        <span className="font-medium">{p.nom}</span>
        <span className="text-sm text-neutral-500">{p.avancement}</span>
      </div>
      <p className="text-sm text-neutral-600">{p.phase}</p>
      {p.bloquant && <p className="mt-1 text-sm text-amber-700">⚠ {p.bloquant}</p>}
    </Link>
  );
}
