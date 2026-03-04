"use client"

import type { Traslado } from "@/lib/types"
import {
  TrasladoStatusBadge,
  PrioridadBadge,
  TipoTrasladoBadge,
} from "@/components/shared/status-badges"
import { Clock, MapPin, ArrowRight, Eye } from "lucide-react"

interface MisTrasladosProps {
  traslados: Traslado[]
  onVerDetalle: (traslado: Traslado) => void
}

export function MisTraslados({ traslados, onVerDetalle }: MisTrasladosProps) {
  if (traslados.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="text-sm text-muted-foreground">
          No ha realizado solicitudes de traslado hoy
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-bold text-card-foreground">
          Mis Solicitudes de Traslado
        </h2>
        <p className="text-xs text-muted-foreground">
          {traslados.length} solicitudes registradas
        </p>
      </div>

      {/* Mobile: cards / Desktop: table */}
      <div className="hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Paciente</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Tipo</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Prioridad</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Destino</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Estado</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Hora</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground">Movil</th>
                <th className="px-4 py-2.5 text-xs font-semibold text-muted-foreground sr-only">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {traslados.map((t) => (
                <tr key={t.id} className="border-b border-border last:border-0 hover:bg-accent/30">
                  <td className="px-4 py-2.5">
                    <p className="font-medium text-card-foreground">{t.paciente.nombreCompleto}</p>
                    <p className="text-xs text-muted-foreground">{t.paciente.documento}</p>
                  </td>
                  <td className="px-4 py-2.5"><TipoTrasladoBadge tipo={t.tipo} /></td>
                  <td className="px-4 py-2.5"><PrioridadBadge prioridad={t.prioridad} /></td>
                  <td className="px-4 py-2.5">
                    <p className="text-xs text-card-foreground">{t.servicioDestino}</p>
                    <p className="text-xs text-muted-foreground">{t.institucionDestino}</p>
                  </td>
                  <td className="px-4 py-2.5"><TrasladoStatusBadge estado={t.estado} /></td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {new Date(t.fechaSolicitud).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-4 py-2.5 text-xs font-medium text-card-foreground">
                    {t.movilAsignada || "---"}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      type="button"
                      onClick={() => onVerDetalle(t)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                      aria-label={`Ver detalle de traslado de ${t.paciente.nombreCompleto}`}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="flex flex-col md:hidden">
        {traslados.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => onVerDetalle(t)}
            className="border-b border-border px-4 py-3 text-left last:border-0 hover:bg-accent/30"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-card-foreground">{t.paciente.nombreCompleto}</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  <TipoTrasladoBadge tipo={t.tipo} />
                  <PrioridadBadge prioridad={t.prioridad} />
                  <TrasladoStatusBadge estado={t.estado} />
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {new Date(t.fechaSolicitud).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
              </div>
            </div>
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{t.servicioDestino}</span>
              <ArrowRight className="h-3 w-3 shrink-0" />
              <span className="truncate">{t.institucionDestino}</span>
            </div>
            {t.movilAsignada && (
              <p className="mt-1 text-xs text-primary font-medium">Movil: {t.movilAsignada}</p>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
