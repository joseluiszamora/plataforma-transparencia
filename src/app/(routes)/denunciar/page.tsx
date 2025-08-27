import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function DenunciarPage({
  searchParams,
}: {
  searchParams?: Promise<{ gracias?: string; error?: string }>;
}) {
  async function createReport(formData: FormData) {
    "use server";

    const description = (formData.get("description") as string)?.trim();
    const department = (formData.get("department") as string)?.trim();
    const city = (formData.get("city") as string)?.trim();
    const policeName = ((formData.get("policeName") as string) || "").trim();
    const policeUnit = ((formData.get("policeUnit") as string) || "").trim();
    const latStr = (formData.get("latitude") as string) || "";
    const lonStr = (formData.get("longitude") as string) || "";
    const isAnonymous = formData.get("isAnonymous") === "on";

    if (!description || !department || !city) {
      return redirect("/denunciar?error=1");
    }

    const latitude = latStr ? Number.parseFloat(latStr) : undefined;
    const longitude = lonStr ? Number.parseFloat(lonStr) : undefined;

    try {
      await prisma.report.create({
        data: {
          description,
          department,
          city,
          policeName: policeName || null,
          policeUnit: policeUnit || null,
          latitude: Number.isFinite(latitude as number)
            ? (latitude as number)
            : null,
          longitude: Number.isFinite(longitude as number)
            ? (longitude as number)
            : null,
          isAnonymous,
          // status queda en PENDING por defecto
        },
      });
    } catch (e) {
      console.error("Error al crear denuncia", e);
      return redirect("/denunciar?error=1");
    }

    redirect("/denunciar?gracias=1");
  }

  const sp = (await searchParams) ?? {};
  const ok = sp.gracias === "1";
  const hasError = sp.error === "1";

  const departments = [
    "La Paz",
    "Cochabamba",
    "Santa Cruz",
    "Oruro",
    "Potosí",
    "Chuquisaca",
    "Tarija",
    "Beni",
    "Pando",
  ];

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-semibold">Enviar una denuncia</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Tu identidad está protegida. No compartas datos personales en la
        descripción.
      </p>

      {ok && (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800 dark:border-green-900/40 dark:bg-green-900/20 dark:text-green-100">
          ¡Gracias! Tu denuncia fue enviada y está en revisión.
        </div>
      )}

      {hasError && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-100">
          Ocurrió un error. Verifica los datos obligatorios e intenta
          nuevamente.
        </div>
      )}

      <form action={createReport} className="mt-8 grid gap-6">
        <div>
          <label
            className="mb-2 block text-sm font-medium"
            htmlFor="description"
          >
            Descripción del hecho
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={5}
            maxLength={2000}
            placeholder="Describe lo ocurrido, sin exponer datos personales."
            className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Máximo 2000 caracteres.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="department"
            >
              Departamento
            </label>
            <select
              id="department"
              name="department"
              required
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              defaultValue=""
            >
              <option value="" disabled>
                Selecciona un departamento
              </option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium" htmlFor="city">
              Ciudad o municipio
            </label>
            <input
              id="city"
              name="city"
              required
              type="text"
              placeholder="Ej: La Paz"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="policeUnit"
            >
              Unidad policial (opcional)
            </label>
            <input
              id="policeUnit"
              name="policeUnit"
              type="text"
              placeholder="Ej: FELCC, UTOP, etc."
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="policeName"
            >
              Nombre del efectivo (opcional)
            </label>
            <input
              id="policeName"
              name="policeName"
              type="text"
              placeholder="Si corresponde"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="latitude"
            >
              Latitud (opcional)
            </label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="any"
              placeholder="Ej: -16.5000"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-medium"
              htmlFor="longitude"
            >
              Longitud (opcional)
            </label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="any"
              placeholder="Ej: -68.1500"
              className="w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isAnonymous"
            name="isAnonymous"
            type="checkbox"
            defaultChecked
            className="h-4 w-4"
          />
          <label htmlFor="isAnonymous" className="text-sm">
            Enviar de forma anónima
          </label>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>Al enviar aceptas nuestras</span>
          <a className="underline" href="/politicas" rel="noopener noreferrer">
            políticas de uso y privacidad
          </a>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Enviar denuncia
          </button>
        </div>
      </form>
    </main>
  );
}
