import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { roleFor } from "@/lib/access";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const role = roleFor(session.user.email);
  return (
    <div className="mx-auto max-w-5xl p-4">
      <nav className="mb-6 flex items-center gap-4 border-b pb-3 text-sm">
        <Link href="/" className="font-medium">Projets</Link>
        {role === "balla" && <Link href="/mes-taches">Mes tâches</Link>}
        <span className="ml-auto text-neutral-500">{session.user.email} ({role})</span>
      </nav>
      {children}
    </div>
  );
}
