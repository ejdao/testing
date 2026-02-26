import { Tags } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function CategoriasPage() {
  return (
    <ModulePlaceholder
      title="Categorias"
      description="Organiza los productos en categorias para una mejor gestion."
      icon={Tags}
      parentModule="Productos / Catalogo"
    />
  )
}
