"use client"

import type { Traslado } from "@/lib/types"
import { useEventos } from "@/lib/store"
import {
  TrasladoStatusBadge,
  PrioridadBadge,
  TipoTrasladoBadge,
} from "@/components/shared/status-badges"
import {
  User,
  MapPin,
  ArrowRight,
  Heart,
  Thermometer,
  Activity,
  Brain,
  Wind,
  Droplets,
  ClipboardList,
  FileText,
  Package,
  Ambulance,
  X,
} from "lucide-react"

interface TrasladoDetailProps {
  traslado: Traslado
  onClose: () => void
  onAsignar: (traslado: Traslado) => void
}

export function TrasladoDetail({ traslado, onClose, onAsignar }: TrasladoDetailProps) {
  const { eventosPorTraslado } = useEventos()
  const eventos = eventosPorTraslado(traslado.id)
  const sv = traslado.signosVitales

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div>
          <h2 className="text-sm font-bold text-card-foreground">
            Detalle Traslado
          </h2>
          <p className="text-xs text-muted-foreground">ID: {traslado.id}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Cerrar detalle"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="max-h-[calc(100vh-320px)] overflow-y-auto">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <TipoTrasladoBadge tipo={traslado.tipo} />
          <PrioridadBadge prioridad={traslado.prioridad} />
          <TrasladoStatusBadge estado={traslado.estado} />
        </div>

        {/* Paciente */}
        <div className="border-b border-border px-4 py-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            Paciente
          </p>
          <p className="text-sm font-semibold text-card-foreground">
            {traslado.paciente.nombreCompleto}
          </p>
          <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{traslado.paciente.tipoDocumento}: {traslado.paciente.documento}</span>
            <span>Edad: {traslado.paciente.edad} anios - {traslado.paciente.sexo}</span>
            <span>EPS: {traslado.paciente.eps}</span>
            <span>{traslado.paciente.tipoAfiliacion}</span>
          </div>
          <p className="mt-2 text-xs text-card-foreground">
            <span className="font-medium">Dx:</span> {traslado.paciente.diagnostico}
          </p>
          {traslado.paciente.cama && (
            <p className="mt-1 text-xs text-muted-foreground">
              Cama: {traslado.paciente.cama}
            </p>
          )}
        </div>

        {/* Ruta */}
        <div className="border-b border-border px-4 py-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <MapPin className="h-3.5 w-3.5" />
            Ruta
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 rounded-lg bg-muted p-2">
              <p className="text-xs font-medium text-card-foreground">{traslado.servicioOrigen}</p>
              <p className="text-xs text-muted-foreground">{traslado.institucionOrigen}</p>
            </div>
            <ArrowRight className="h-4 w-4 shrink-0 text-primary" />
            <div className="flex-1 rounded-lg bg-muted p-2">
              <p className="text-xs font-medium text-card-foreground">{traslado.servicioDestino}</p>
              <p className="text-xs text-muted-foreground">{traslado.institucionDestino}</p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium">Motivo:</span> {traslado.motivoTraslado}
          </p>
        </div>

        {/* Signos Vitales */}
        <div className="border-b border-border px-4 py-3">
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Activity className="h-3.5 w-3.5" />
            Signos Vitales
          </p>
          <div className="grid grid-cols-3 gap-2">
            <VitalSign icon={<Droplets className="h-3.5 w-3.5" />} label="T/A" value={`${sv.tensionSistolica}/${sv.tensionDiastolica}`} unit="mmHg" warn={sv.tensionSistolica < 90 || sv.tensionSistolica > 160} />
            <VitalSign icon={<Heart className="h-3.5 w-3.5" />} label="FC" value={sv.frecuenciaCardiaca.toString()} unit="lpm" warn={sv.frecuenciaCardiaca > 100 || sv.frecuenciaCardiaca < 60} />
            <VitalSign icon={<Wind className="h-3.5 w-3.5" />} label="FR" value={sv.frecuenciaRespiratoria.toString()} unit="rpm" warn={sv.frecuenciaRespiratoria > 22} />
            <VitalSign icon={<Activity className="h-3.5 w-3.5" />} label="SpO2" value={sv.spo2.toString()} unit="%" warn={sv.spo2 < 94} />
            <VitalSign icon={<Thermometer className="h-3.5 w-3.5" />} label="Temp" value={sv.temperatura.toString()} unit="C" warn={sv.temperatura > 38} />
            <VitalSign icon={<Brain className="h-3.5 w-3.5" />} label="Glasgow" value={sv.glasgow.toString()} unit="/15" warn={sv.glasgow < 14} />
          </div>
        </div>

        {/* Nota enfermeria */}
        {traslado.notaEnfermeria && (
          <div className="border-b border-border px-4 py-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Nota de Enfermeria
            </p>
            <p className="text-xs leading-relaxed text-card-foreground">
              {traslado.notaEnfermeria}
            </p>
          </div>
        )}

        {/* Equipo requerido */}
        {traslado.equipoRequerido.length > 0 && (
          <div className="border-b border-border px-4 py-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Package className="h-3.5 w-3.5" />
              Equipo Requerido
            </p>
            <div className="flex flex-wrap gap-1">
              {traslado.equipoRequerido.map((eq) => (
                <span key={eq} className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {eq}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Movil asignada */}
        {traslado.movilAsignada && (
          <div className="border-b border-border px-4 py-3">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Ambulance className="h-3.5 w-3.5" />
              Movil Asignada
            </p>
            <p className="text-sm font-semibold text-card-foreground">
              {traslado.movilAsignada}
            </p>
            {traslado.conductorAsignado && (
              <p className="text-xs text-muted-foreground">
                Conductor: {traslado.conductorAsignado}
              </p>
            )}
          </div>
        )}

        {/* Timeline */}
        {eventos.length > 0 && (
          <div className="px-4 py-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" />
              Timeline
            </p>
            <div className="relative ml-2 border-l-2 border-border pl-4">
              {eventos.map((ev, i) => (
                <div key={ev.id} className={`relative pb-3 ${i === eventos.length - 1 ? "pb-0" : ""}`}>
                  <div className="absolute -left-[21px] top-0.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-card" />
                  <p className="text-xs font-medium text-card-foreground">{ev.descripcion}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(ev.fecha).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}{" "}
                    - {ev.usuario}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action */}
      {traslado.estado === "pendiente" && (
        <div className="border-t border-border px-4 py-3">
          <button
            type="button"
            onClick={() => onAsignar(traslado)}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Ambulance className="h-4 w-4" />
            Asignar Movil
          </button>
        </div>
      )}
    </div>
  )
}

function VitalSign({
  icon,
  label,
  value,
  unit,
  warn,
}: {
  icon: React.ReactNode
  label: string
  value: string
  unit: string
  warn?: boolean
}) {
  return (
    <div
      className={`rounded-lg border p-2 text-center ${
        warn
          ? "border-destructive/30 bg-destructive/5"
          : "border-border bg-muted/30"
      }`}
    >
      <div className={`mx-auto mb-1 flex h-5 w-5 items-center justify-center ${warn ? "text-destructive" : "text-muted-foreground"}`}>
        {icon}
      </div>
      <p className={`text-sm font-bold ${warn ? "text-destructive" : "text-card-foreground"}`}>
        {value}
        <span className="text-xs font-normal text-muted-foreground"> {unit}</span>
      </p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  )
}
