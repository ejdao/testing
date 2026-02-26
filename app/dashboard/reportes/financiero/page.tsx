import { DollarSign } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function FinancieroPage() {
  return (
    <ModulePlaceholder
      title="Reporte Financiero"
      description="Revisa el estado financiero con balances, ingresos y egresos."
      icon={DollarSign}
      parentModule="Reportes / Financieros"
    />
  )
}
