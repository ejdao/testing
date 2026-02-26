import { FileCheck } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function ContratosPage() {
  return (
    <ModulePlaceholder
      title="Contratos"
      description="Administra contratos activos, vencidos y en proceso."
      icon={FileCheck}
      parentModule="Documentos / Generacion"
    />
  )
}
