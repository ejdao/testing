import { TrendingUp } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function VentasPage() {
  return (
    <ModulePlaceholder
      title="Reporte de Ventas"
      description="Analiza las ventas con graficos detallados y metricas clave."
      icon={TrendingUp}
      parentModule="Reportes / Financieros"
    />
  )
}
