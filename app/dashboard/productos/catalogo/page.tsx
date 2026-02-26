import { Package } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function CatalogoPage() {
  return (
    <ModulePlaceholder
      title="Catalogo de Productos"
      description="Explora y gestiona el catalogo completo de productos disponibles."
      icon={Package}
      parentModule="Productos / Catalogo"
    />
  )
}
