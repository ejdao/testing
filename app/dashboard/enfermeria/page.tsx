"use client"

import { useState } from "react"
import { useAuth, useTraslados } from "@/lib/store"
import type { Traslado } from "@/lib/types"
import { DashboardHeader } from "@/components/shared/header"
import { MisTraslados } from "@/components/enfermeria/mis-traslados"
import { SolicitudForm } from "@/components/enfermeria/solicitud-form"
import { TrasladoDetail } from "@/components/central/traslado-detail"
import {
  Plus,
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

export default function EnfermeriaPage() {
  const { usuario } = useAuth()
  const { trasladosPorEnfermero } = useTraslados()
  const [showForm, setShowForm] = useState(false)
  const [selectedTraslado, setSelectedTraslado] = useState<Traslado | null>(null)

  const misTraslados = usuario
    ? trasladosPorEnfermero(usuario.id)
    : []

  const pendientes = misTraslados.filter((t) => t.estado === "pendiente").length
  const enCurso = misTraslados.filter(
    (t) =>
      t.estado === "asignado" ||
      t.estado === "en_camino" ||
      t.estado === "en_origen" ||
      t.estado === "en_traslado"
  ).length
  const completados = misTraslados.filter((t) => t.estado === "completado").length

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Enfermeria - Solicitudes de Traslado" />

      <div className="flex flex-col gap-4 p-4 lg:p-6">
        {/* Top row: KPIs + action */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="grid grid-cols-3 gap-3 sm:flex sm:gap-4">
            <MiniKpi
              icon={<AlertTriangle className="h-4 w-4 text-warning" />}
              label="Pendientes"
              value={pendientes}
              highlight={pendientes > 0}
            />
            <MiniKpi
              icon={<Clock className="h-4 w-4 text-primary" />}
              label="En Curso"
              value={enCurso}
            />
            <MiniKpi
              icon={<CheckCircle2 className="h-4 w-4 text-success" />}
              label="Completados"
              value={completados}
            />
          </div>

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            Solicitar Traslado
          </button>
        </div>

        {/* Main content */}
        <div className={`grid gap-4 ${selectedTraslado ? "grid-cols-1 lg:grid-cols-12" : "grid-cols-1"}`}>
          <div className={selectedTraslado ? "lg:col-span-7" : ""}>
            <MisTraslados
              traslados={misTraslados}
              onVerDetalle={setSelectedTraslado}
            />
          </div>
          {selectedTraslado && (
            <div className="lg:col-span-5">
              <TrasladoDetail
                traslado={selectedTraslado}
                onClose={() => setSelectedTraslado(null)}
                onAsignar={() => {}}
              />
            </div>
          )}
        </div>
      </div>

      {/* Solicitud form */}
      <SolicitudForm open={showForm} onClose={() => setShowForm(false)} />
    </div>
  )
}

function MiniKpi({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode
  label: string
  value: number
  highlight?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm ${
        highlight ? "border-warning/40 ring-1 ring-warning/20" : "border-border"
      }`}
    >
      {icon}
      <div>
        <p className="text-lg font-bold text-card-foreground">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}
