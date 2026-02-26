import { ClipboardList } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function InventarioPage() {
  return (
    <ModulePlaceholder
      title="Inventario"
      description="Controla el stock, entradas y salidas de productos."
      icon={ClipboardList}
      parentModule="Productos / Stock"
    />
  )
}
