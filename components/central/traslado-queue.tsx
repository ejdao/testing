"use client"

import type { Traslado } from "@/lib/types"
import {
  TrasladoStatusBadge,
  PrioridadBadge,
  TipoTrasladoBadge,
} from "@/components/shared/status-badges"
import { Clock, User, MapPin, ArrowRight } from "lucide-react"

interface TrasladoQueueProps {
  traslados: Traslado[]
  onSelect: (traslado: Traslado) => void
  selectedId?: string
}

export function TrasladoQueue({ traslados, onSelect, selectedId }: TrasladoQueueProps) {
  const pendientes = traslados.filter((t) => t.estado === "pendiente")
  const activos = traslados.filter(
    (t) =>
      t.estado === "asignado" ||
      t.estado === "en_camino" ||
      t.estado === "en_origen" ||
      t.estado === "en_traslado"
  )

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold text-card-foreground">
          Cola de Traslados
        </h2>
        <p className="text-xs text-muted-foreground">
          {pendientes.length} pendientes - {activos.length} activos
        </p>
      </div>

      <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
        {/* Pendientes */}
        {pendientes.length > 0 && (
          <div>
            <div className="sticky top-0 z-10 border-b border-border bg-warning/5 px-4 py-1.5">
              <p className="text-xs font-semibold text-warning">
                Pendientes ({pendientes.length})
              </p>
            </div>
            {pendientes.map((t) => (
              <TrasladoQueueItem
                key={t.id}
                traslado={t}
                isSelected={selectedId === t.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}

        {/* Activos */}
        {activos.length > 0 && (
          <div>
            <div className="sticky top-0 z-10 border-b border-border bg-primary/5 px-4 py-1.5">
              <p className="text-xs font-semibold text-primary">
                En Curso ({activos.length})
              </p>
            </div>
            {activos.map((t) => (
              <TrasladoQueueItem
                key={t.id}
                traslado={t}
                isSelected={selectedId === t.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}

        {pendientes.length === 0 && activos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p className="text-sm">No hay traslados activos</p>
          </div>
        )}
      </div>
    </div>
  )
}

function TrasladoQueueItem({
  traslado,
  isSelected,
  onSelect,
}: {
  traslado: Traslado
  isSelected: boolean
  onSelect: (t: Traslado) => void
}) {
  const hora = new Date(traslado.fechaSolicitud).toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <button
      type="button"
      onClick={() => onSelect(traslado)}
      className={`w-full border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent/50 ${
        isSelected ? "bg-primary/5 ring-1 ring-inset ring-primary/20" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 overflow-hidden">
          <p className="truncate text-sm font-semibold text-card-foreground">
            {traslado.paciente.nombreCompleto}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <TipoTrasladoBadge tipo={traslado.tipo} />
            <PrioridadBadge prioridad={traslado.prioridad} />
            <TrasladoStatusBadge estado={traslado.estado} />
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {hora}
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
        <MapPin className="h-3 w-3 shrink-0" />
        <span className="truncate">{traslado.servicioOrigen}</span>
        <ArrowRight className="h-3 w-3 shrink-0" />
        <span className="truncate">{traslado.institucionDestino}</span>
      </div>
      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <User className="h-3 w-3 shrink-0" />
        <span>{traslado.enfermeroSolicitante}</span>
      </div>
    </button>
  )
}
