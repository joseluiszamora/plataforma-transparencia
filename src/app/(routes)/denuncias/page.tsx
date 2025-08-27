import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const revalidate = 60;

export default async function DenunciasPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  const page = Math.max(1, Number.parseInt(sp.page || "1", 10) || 1);
  const pageSize = 24;
  const offset = (page - 1) * pageSize;

  type CountRow = { count: number };
  type ReportRow = {
    id: string;
    department: string;
    city: string;
    description: string;
    createdAt: Date;
    isAnonymous: boolean;
    status: "PENDING" | "APPROVED" | "REJECTED";
  };

  const [countRows, reports] = await Promise.all([
    prisma.$queryRaw<CountRow[]>`SELECT COUNT(*)::int AS count FROM "Report"`,
    prisma.$queryRaw<ReportRow[]>`
      SELECT id, department, city, description, "createdAt", "isAnonymous", status
      FROM "Report"
      ORDER BY "createdAt" DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `,
  ]);

  const total = countRows?.[0]?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Todas las denuncias</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Se muestran {reports.length} de {total.toLocaleString()} denuncias.
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <article
            key={r.id}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {r.department} • {r.city}
              </div>
              <StatusBadge status={r.status} />
            </div>
            <p className="mt-3 line-clamp-3 text-sm">{r.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              <span>{r.isAnonymous ? "Anónima" : ""}</span>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3 text-sm">
          <Link
            className={`rounded-lg border px-3 py-1 ${
              page <= 1 ? "pointer-events-none opacity-50" : "hover:bg-muted"
            }`}
            href={`/denuncias?page=${page - 1}`}
          >
            Anterior
          </Link>
          <span className="text-muted-foreground">
            Página {page} de {totalPages}
          </span>
          <Link
            className={`rounded-lg border px-3 py-1 ${
              page >= totalPages
                ? "pointer-events-none opacity-50"
                : "hover:bg-muted"
            }`}
            href={`/denuncias?page=${page + 1}`}
          >
            Siguiente
          </Link>
        </nav>
      )}
    </main>
  );
}

function StatusBadge({
  status,
}: {
  status: "PENDING" | "APPROVED" | "REJECTED";
}) {
  const map: Record<
    typeof status,
    { bg: string; text: string; label: string }
  > = {
    PENDING: {
      bg: "bg-amber-100 dark:bg-amber-900/30",
      text: "text-amber-800 dark:text-amber-100",
      label: "Pendiente",
    },
    APPROVED: {
      bg: "bg-green-100 dark:bg-green-900/30",
      text: "text-green-800 dark:text-green-100",
      label: "Aprobada",
    },
    REJECTED: {
      bg: "bg-rose-100 dark:bg-rose-900/30",
      text: "text-rose-800 dark:text-rose-100",
      label: "Rechazada",
    },
  };
  const s = map[status];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}
