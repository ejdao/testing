import { Layout } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function PlantillasPage() {
  return (
    <ModulePlaceholder
      title="Plantillas"
      description="Crea y gestiona plantillas de documentos reutilizables."
      icon={Layout}
      parentModule="Documentos / Recursos"
    />
  )
}
