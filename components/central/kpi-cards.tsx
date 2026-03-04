"use client"

import { useTraslados, useMoviles } from "@/lib/store"
import {
  ClipboardList,
  Ambulance,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react"

export function KpiCards() {
  const { trasladosHoy, trasladosPendientes } = useTraslados()
  const { moviles, movilesDisponibles } = useMoviles()

  const completados = trasladosHoy.filter(
    (t) => t.estado === "completado"
  ).length
  const enCurso = trasladosHoy.filter(
    (t) =>
      t.estado === "en_camino" ||
      t.estado === "en_origen" ||
      t.estado === "en_traslado"
  ).length

  const cards = [
    {
      title: "Traslados Hoy",
      value: trasladosHoy.length,
      icon: ClipboardList,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      title: "Pendientes",
      value: trasladosPendientes.length,
      icon: AlertTriangle,
      iconBg: "bg-warning/10",
      iconColor: "text-warning",
      highlight: trasladosPendientes.length > 0,
    },
    {
      title: "Moviles Disponibles",
      value: `${movilesDisponibles.length} / ${moviles.length}`,
      icon: Ambulance,
      iconBg: "bg-success/10",
      iconColor: "text-success",
    },
    {
      title: "Completados",
      value: completados,
      icon: CheckCircle2,
      iconBg: "bg-success/10",
      iconColor: "text-success",
      sub: enCurso > 0 ? `${enCurso} en curso` : undefined,
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <div
            key={card.title}
            className={`rounded-xl border bg-card p-4 shadow-sm ${
              card.highlight
                ? "border-warning/40 ring-1 ring-warning/20"
                : "border-border"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted-foreground">
                {card.title}
              </p>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.iconBg}`}
              >
                <Icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className="mt-2 text-2xl font-bold text-card-foreground">
              {card.value}
            </p>
            {card.sub && (
              <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
