import { prisma } from "@/lib/prisma";

export const revalidate = 60;

export default async function DenunciasPage() {
  const reports = await prisma.report.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 24,
    select: {
      id: true,
      department: true,
      city: true,
      description: true,
      createdAt: true,
      isAnonymous: true,
    },
  });

  type ReportCard = (typeof reports)[number];

  return (
    <main className="container mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-2xl font-semibold">Denuncias aprobadas</h1>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r: ReportCard) => (
          <article
            key={r.id}
            className="rounded-xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {r.department} • {r.city}
              </div>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-200">
                Aprobada
              </span>
            </div>
            <p className="mt-3 line-clamp-3 text-sm">{r.description}</p>
            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(r.createdAt).toLocaleDateString()}</span>
              <span>{r.isAnonymous ? "Anónima" : ""}</span>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
