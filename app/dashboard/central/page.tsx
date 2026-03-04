"use client"

import { useState } from "react"
import { useTraslados } from "@/lib/store"
import type { Traslado } from "@/lib/types"
import { DashboardHeader } from "@/components/shared/header"
import { KpiCards } from "@/components/central/kpi-cards"
import { TrasladoQueue } from "@/components/central/traslado-queue"
import { MovilGrid } from "@/components/central/movil-grid"
import { TrasladoDetail } from "@/components/central/traslado-detail"
import { AsignarMovilDialog } from "@/components/central/asignar-movil-dialog"

export default function CentralPage() {
  const { trasladosHoy } = useTraslados()
  const [selectedTraslado, setSelectedTraslado] = useState<Traslado | null>(null)
  const [asignarTraslado, setAsignarTraslado] = useState<Traslado | null>(null)

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Central de Ambulancias" />

      <div className="flex flex-col gap-4 p-4 lg:p-6">
        {/* KPIs */}
        <KpiCards />

        {/* Main content: 3-column layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Queue */}
          <div className="lg:col-span-4">
            <TrasladoQueue
              traslados={trasladosHoy}
              onSelect={setSelectedTraslado}
              selectedId={selectedTraslado?.id}
            />
          </div>

          {/* Movil Grid or Detail */}
          {selectedTraslado ? (
            <>
              <div className="lg:col-span-4">
                <TrasladoDetail
                  traslado={selectedTraslado}
                  onClose={() => setSelectedTraslado(null)}
                  onAsignar={setAsignarTraslado}
                />
              </div>
              <div className="lg:col-span-4">
                <MovilGrid />
              </div>
            </>
          ) : (
            <div className="lg:col-span-8">
              <MovilGrid />
            </div>
          )}
        </div>
      </div>

      {/* Asignar dialog */}
      {asignarTraslado && (
        <AsignarMovilDialog
          traslado={asignarTraslado}
          open={!!asignarTraslado}
          onClose={() => setAsignarTraslado(null)}
        />
      )}
    </div>
  )
}
