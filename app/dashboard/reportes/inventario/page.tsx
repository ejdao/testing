import { Warehouse } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function InventarioReportPage() {
  return (
    <ModulePlaceholder
      title="Reporte de Inventario"
      description="Visualiza el estado actual del inventario y movimientos de stock."
      icon={Warehouse}
      parentModule="Reportes / Operativos"
    />
  )
}
