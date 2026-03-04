import type { EstadoTraslado, PrioridadTraslado, EstadoMovil, TipoMovil, TipoTraslado } from "@/lib/types"

const estadoTrasladoMap: Record<EstadoTraslado, { label: string; className: string }> = {
  pendiente: { label: "Pendiente", className: "bg-warning/15 text-warning border-warning/30" },
  asignado: { label: "Asignado", className: "bg-primary/15 text-primary border-primary/30" },
  en_camino: { label: "En Camino", className: "bg-primary/15 text-primary border-primary/30" },
  en_origen: { label: "En Origen", className: "bg-accent text-accent-foreground border-border" },
  en_traslado: { label: "En Traslado", className: "bg-primary/15 text-primary border-primary/30" },
  entregado: { label: "Entregado", className: "bg-success/15 text-success border-success/30" },
  completado: { label: "Completado", className: "bg-success/15 text-success border-success/30" },
  cancelado: { label: "Cancelado", className: "bg-destructive/15 text-destructive border-destructive/30" },
}

export function TrasladoStatusBadge({ estado }: { estado: EstadoTraslado }) {
  const config = estadoTrasladoMap[estado]
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}

const prioridadMap: Record<PrioridadTraslado, { label: string; className: string }> = {
  urgente: { label: "Urgente", className: "bg-destructive/15 text-destructive border-destructive/30" },
  programado: { label: "Programado", className: "bg-muted text-muted-foreground border-border" },
}

export function PrioridadBadge({ prioridad }: { prioridad: PrioridadTraslado }) {
  const config = prioridadMap[prioridad]
  return (
    <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}

const estadoMovilMap: Record<EstadoMovil, { label: string; className: string; dot: string }> = {
  disponible: { label: "Disponible", className: "bg-success/15 text-success border-success/30", dot: "bg-success" },
  en_servicio: { label: "En Servicio", className: "bg-primary/15 text-primary border-primary/30", dot: "bg-primary" },
  retornando: { label: "Retornando", className: "bg-warning/15 text-warning border-warning/30", dot: "bg-warning" },
  mantenimiento: { label: "Mantenimiento", className: "bg-muted text-muted-foreground border-border", dot: "bg-muted-foreground" },
  fuera_servicio: { label: "Fuera Servicio", className: "bg-destructive/15 text-destructive border-destructive/30", dot: "bg-destructive" },
}

export function MovilStatusBadge({ estado }: { estado: EstadoMovil }) {
  const config = estadoMovilMap[estado]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-semibold ${config.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  )
}

const tipoMovilMap: Record<TipoMovil, { label: string; className: string }> = {
  basica: { label: "Basica", className: "bg-secondary text-secondary-foreground" },
  medicalizada: { label: "Medicalizada", className: "bg-primary/10 text-primary" },
  TAM: { label: "TAM", className: "bg-warning/10 text-warning" },
}

export function TipoMovilBadge({ tipo }: { tipo: TipoMovil }) {
  const config = tipoMovilMap[tipo]
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}

const tipoTrasladoMap: Record<TipoTraslado, { label: string; className: string }> = {
  primario: { label: "Primario", className: "bg-secondary text-secondary-foreground" },
  secundario: { label: "Secundario", className: "bg-primary/10 text-primary" },
}

export function TipoTrasladoBadge({ tipo }: { tipo: TipoTraslado }) {
  const config = tipoTrasladoMap[tipo]
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold ${config.className}`}>
      {config.label}
    </span>
  )
}
