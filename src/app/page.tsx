import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";

export const revalidate = 60; // Revalidar cada 60s para stats y listados

export default async function Home() {
  // Tipos auxiliares para resultados raw
  type CountRow = { count: number };
  type LatestReport = {
    id: string;
    city: string;
    department: string;
    createdAt: Date;
    description: string;
    policeUnit: string | null;
    policeName: string | null;
    isAnonymous: boolean;
  };

  // Contadores
  const [approvedRows, documentsCount, categoriesCount] = await Promise.all([
    prisma.$queryRaw<
      CountRow[]
    >`SELECT COUNT(*)::int AS count FROM "Report" WHERE status = 'APPROVED'`,
    prisma.document.count({ where: { isPublic: true } }),
    prisma.category.count(),
  ]);
  const approvedCount: number = (approvedRows?.[0]?.count ?? 0) as number;

  const [latestReports, featuredDocuments] = await Promise.all([
    prisma.$queryRaw<LatestReport[]>`
      SELECT id, city, department, "createdAt", description, "policeUnit", "policeName", "isAnonymous"
      FROM "Report"
      WHERE status = 'APPROVED'
      ORDER BY "createdAt" DESC
      LIMIT 6
    `,
    prisma.document.findMany({
      where: { isPublic: true },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        category: true,
        fileType: true,
        publishedAt: true,
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/40 dark:to-background" />
        <div className="container mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                Plataforma ciudadana • Transparencia
              </span>
              <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Denuncia de forma segura y anónima. Accede a información
                pública.
              </h1>
              <p className="mt-4 text-base text-muted-foreground sm:text-lg">
                Visibiliza hechos, comparte evidencias y consulta documentos
                oficiales. Tu identidad está protegida.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/denunciar"
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  Denunciar ahora
                </Link>
                <Link
                  href="/documentos"
                  className="inline-flex items-center justify-center rounded-lg border border-indigo-200 px-5 py-3 text-sm font-medium hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-950/40"
                >
                  Ver documentos
                </Link>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                No uses este sitio para emergencias. Acude a los canales
                oficiales.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="flex h-full items-center justify-center">
                  <Image
                    src="/globe.svg"
                    alt="Mapa"
                    width={180}
                    height={180}
                    className="opacity-70 dark:invert"
                  />
                </div>
              </div>
              <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Métricas */}
      <section className="border-y border-border bg-muted/20">
        <div className="container mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard label="Denuncias aprobadas" value={approvedCount} />
          <StatCard
            label="Documentos públicos"
            value={documentsCount as number}
          />
          <StatCard
            label="Categorías de documentos"
            value={categoriesCount as number}
          />
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Cómo funciona</h2>
        <p className="mt-2 text-muted-foreground">
          Tres pasos sencillos para participar
        </p>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          <HowItWorksStep
            step="1"
            title="Describe el hecho"
            desc="Indica lugar, fecha y detalles relevantes. Puedes mantener el anonimato."
          />
          <HowItWorksStep
            step="2"
            title="Sube evidencias"
            desc="Imágenes, videos, audio o documentos que respalden tu denuncia."
          />
          <HowItWorksStep
            step="3"
            title="Moderación y publicación"
            desc="Revisamos el contenido y, si procede, lo publicamos para la comunidad."
          />
        </div>
      </section>

      {/* Mapa (placeholder) */}
      <section className="container mx-auto max-w-6xl px-4 pb-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium">Mapa de denuncias</h3>
              <p className="text-sm text-muted-foreground">
                Explora las denuncias aprobadas por ubicación
              </p>
            </div>
            <Link
              href="/mapa"
              className="text-sm text-indigo-600 hover:underline"
            >
              Ver mapa
            </Link>
          </div>
          <div className="mt-4 h-64 w-full rounded-lg bg-gradient-to-br from-indigo-100 to-indigo-50 dark:from-indigo-950/30 dark:to-indigo-900/20 flex items-center justify-center text-sm text-muted-foreground">
            Próximamente: visualización de mapa y heatmap
          </div>
        </div>
      </section>

      {/* Últimas denuncias aprobadas */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              Últimas denuncias aprobadas
            </h2>
            <p className="mt-2 text-muted-foreground">
              Contenido moderado y publicado para consulta pública
            </p>
          </div>
          <Link
            href="/denuncias"
            className="text-sm text-indigo-600 hover:underline"
          >
            Ver todas
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {latestReports.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              Aún no hay denuncias aprobadas.
            </div>
          )}
          {latestReports.map((r: LatestReport) => (
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
                <span>
                  {r.isAnonymous
                    ? "Anónima"
                    : r.policeUnit || r.policeName
                    ? "Con datos de referencia"
                    : ""}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Documentos destacados */}
      <section className="container mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Documentos destacados</h2>
            <p className="mt-2 text-muted-foreground">
              Consulta documentos públicos recientes
            </p>
          </div>
          <Link
            href="/documentos"
            className="text-sm text-indigo-600 hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDocuments.length === 0 && (
            <div className="col-span-full rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
              Aún no hay documentos públicos.
            </div>
          )}
          {featuredDocuments.map((d) => (
            <article
              key={d.id}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded bg-indigo-100 text-[10px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200">
                  {d.fileType?.toUpperCase() ?? "DOC"}
                </span>
                <span>{d.category}</span>
              </div>
              <h3 className="mt-3 line-clamp-2 font-medium">{d.title}</h3>
              <div className="mt-3 text-xs text-muted-foreground">
                Publicado el {new Date(d.publishedAt).toLocaleDateString()}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Compromiso de privacidad */}
      <section className="border-t border-border bg-muted/20">
        <div className="container mx-auto max-w-6xl px-4 py-14 grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold">Compromiso de privacidad</h2>
            <p className="mt-2 text-muted-foreground">
              Tus datos se cifran y no publicamos información que pueda
              identificarte. Puedes denunciar de forma totalmente anónima.
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/politicas"
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Ver políticas
            </Link>
            <Link
              href="/faq"
              className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-muted"
            >
              Preguntas frecuentes
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ breve */}
      <section className="container mx-auto max-w-6xl px-4 py-16">
        <h2 className="text-2xl font-semibold">Preguntas frecuentes</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <FAQItem
            q="¿La denuncia es realmente anónima?"
            a="Sí. No pedimos datos personales para enviar una denuncia y ocultamos cualquier dato sensible antes de publicar."
          />
          <FAQItem
            q="¿Qué evidencias puedo subir?"
            a="Imágenes, videos, audio y documentos. Evita contenidos que expongan datos personales de terceros."
          />
          <FAQItem
            q="¿Cuánto tarda la moderación?"
            a="Dependiendo del volumen, puede tardar de horas a pocos días. Te avisaremos si habilitamos seguimiento."
          />
          <FAQItem
            q="¿Qué documentos encuentro aquí?"
            a="Presupuestos, contratos, normativas, informes y más aportados por instituciones u organizaciones aliadas."
          />
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container mx-auto max-w-6xl px-4 py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Plataforma de Transparencia
          </p>
          <div className="flex gap-4 text-sm">
            <Link href="/politicas" className="hover:underline">
              Privacidad
            </Link>
            <Link href="/politicas" className="hover:underline">
              Términos
            </Link>
            <Link href="/contacto" className="hover:underline">
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 text-center">
      <div className="text-3xl font-semibold">{value.toLocaleString()}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function HowItWorksStep({
  step,
  title,
  desc,
}: {
  step: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
          {step}
        </span>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="rounded-lg border border-border bg-card p-4">
      <summary className="cursor-pointer list-none font-medium">{q}</summary>
      <p className="mt-2 text-sm text-muted-foreground">{a}</p>
    </details>
  );
}
