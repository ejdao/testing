"use client"

import { useState } from "react"
import type { Traslado } from "@/lib/types"
import { useMoviles, useTraslados, useEventos, useAuth } from "@/lib/store"
import { TipoMovilBadge } from "@/components/shared/status-badges"
import { toast } from "sonner"
import { X, Ambulance, Users, CheckCircle2 } from "lucide-react"

interface AsignarMovilDialogProps {
  traslado: Traslado
  open: boolean
  onClose: () => void
}

export function AsignarMovilDialog({
  traslado,
  open,
  onClose,
}: AsignarMovilDialogProps) {
  const { movilesDisponibles, actualizarMovil } = useMoviles()
  const { actualizarTraslado } = useTraslados()
  const { agregarEvento } = useEventos()
  const { usuario } = useAuth()
  const [selectedMovilId, setSelectedMovilId] = useState<string | null>(null)
  const [observaciones, setObservaciones] = useState("")

  if (!open) return null

  const handleAsignar = () => {
    if (!selectedMovilId) {
      toast.error("Seleccione una movil")
      return
    }

    const movil = movilesDisponibles.find((m) => m.id === selectedMovilId)
    if (!movil) return

    const ahora = new Date().toISOString()

    // Update traslado
    actualizarTraslado(traslado.id, {
      estado: "asignado",
      movilAsignada: movil.numero,
      fechaAsignacion: ahora,
      operadorCentral: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Central",
      conductorAsignado: movil.tripulacion.find((t) => t.rol === "conductor")?.nombre,
    })

    // Update movil
    actualizarMovil(movil.id, {
      estado: "en_servicio",
      trasladoActual: traslado.id,
    })

    // Add event
    agregarEvento({
      id: `e-${Date.now()}`,
      trasladoId: traslado.id,
      tipo: "asignado",
      descripcion: `Movil ${movil.numero} asignada por Central`,
      fecha: ahora,
      usuario: usuario ? `${usuario.nombre} ${usuario.apellido}` : "Central",
    })

    toast.success(`Movil ${movil.numero} asignada al traslado ${traslado.id}`)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-foreground/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 mx-4 w-full max-w-lg rounded-xl border border-border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-bold text-card-foreground">
              Asignar Movil
            </h2>
            <p className="text-xs text-muted-foreground">
              Traslado: {traslado.paciente.nombreCompleto}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-96 overflow-y-auto px-6 py-4">
          {/* Movil selection */}
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Moviles Disponibles ({movilesDisponibles.length})
          </p>

          {movilesDisponibles.length === 0 ? (
            <div className="rounded-lg bg-warning/10 p-3 text-center">
              <p className="text-sm font-medium text-warning">
                No hay moviles disponibles
              </p>
              <p className="text-xs text-muted-foreground">
                Todas las unidades estan en servicio o fuera de operacion
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {movilesDisponibles.map((movil) => (
                <button
                  key={movil.id}
                  type="button"
                  onClick={() => setSelectedMovilId(movil.id)}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${
                    selectedMovilId === movil.id
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30 hover:bg-accent/50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                      selectedMovilId === movil.id
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Ambulance className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-card-foreground">
                        {movil.numero}
                      </span>
                      <TipoMovilBadge tipo={movil.tipo} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Placa: {movil.placa}
                    </p>
                    {movil.tripulacion.length > 0 && (
                      <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>
                          {movil.tripulacion.map((t) => t.nombre.split(" ")[0]).join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                  {selectedMovilId === movil.id && (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Observaciones */}
          <div className="mt-4">
            <label
              htmlFor="obs-asignar"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Observaciones de Central
            </label>
            <textarea
              id="obs-asignar"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Observaciones adicionales..."
              rows={2}
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleAsignar}
            disabled={!selectedMovilId}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Ambulance className="h-4 w-4" />
            Confirmar Asignacion
          </button>
        </div>
      </div>
    </div>
  )
}
