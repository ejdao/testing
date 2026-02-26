import { FileText } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function FacturasPage() {
  return (
    <ModulePlaceholder
      title="Facturas"
      description="Gestiona y visualiza todas las facturas generadas."
      icon={FileText}
      parentModule="Documentos / Generacion"
    />
  )
}
