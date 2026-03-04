"use client"

import { useMoviles } from "@/lib/store"
import type { Movil } from "@/lib/types"
import { MovilStatusBadge, TipoMovilBadge } from "@/components/shared/status-badges"
import { Users, MapPin, Truck } from "lucide-react"

export function MovilGrid() {
  const { moviles } = useMoviles()

  const disponibles = moviles.filter((m) => m.estado === "disponible")
  const enServicio = moviles.filter((m) => m.estado === "en_servicio")
  const retornando = moviles.filter((m) => m.estado === "retornando")
  const otros = moviles.filter(
    (m) =>
      m.estado === "mantenimiento" || m.estado === "fuera_servicio"
  )

  const sections = [
    { title: "Disponibles", moviles: disponibles },
    { title: "En Servicio", moviles: enServicio },
    { title: "Retornando", moviles: retornando },
    { title: "Fuera de Servicio", moviles: otros },
  ].filter((s) => s.moviles.length > 0)

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-card-foreground">
              Flota de Moviles
            </h2>
            <p className="text-xs text-muted-foreground">
              {disponibles.length} disponibles de {moviles.length} totales
            </p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Truck className="h-4 w-4 text-primary" />
          </div>
        </div>
      </div>

      <div className="max-h-[calc(100vh-320px)] overflow-y-auto p-4">
        {sections.map((section) => (
          <div key={section.title} className="mb-4 last:mb-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.title} ({section.moviles.length})
            </p>
            <div className="grid grid-cols-1 gap-2 xl:grid-cols-2">
              {section.moviles.map((movil) => (
                <MovilCard key={movil.id} movil={movil} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MovilCard({ movil }: { movil: Movil }) {
  return (
    <div
      className={`rounded-lg border p-3 transition-colors ${
        movil.estado === "disponible"
          ? "border-success/30 bg-success/5"
          : movil.estado === "en_servicio"
          ? "border-primary/30 bg-primary/5"
          : movil.estado === "retornando"
          ? "border-warning/30 bg-warning/5"
          : "border-border bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-card-foreground">
            {movil.numero}
          </span>
          <TipoMovilBadge tipo={movil.tipo} />
        </div>
        <MovilStatusBadge estado={movil.estado} />
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        Placa: {movil.placa}
      </p>

      {movil.tripulacion.length > 0 && (
        <div className="mt-2 flex items-start gap-1.5">
          <Users className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
          <div className="flex flex-wrap gap-1">
            {movil.tripulacion.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center rounded bg-secondary px-1.5 py-0.5 text-xs text-secondary-foreground"
              >
                {t.nombre.split(" ")[0]} ({t.rol})
              </span>
            ))}
          </div>
        </div>
      )}

      {movil.ubicacion && (
        <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{movil.ubicacion}</span>
        </div>
      )}
    </div>
  )
}
