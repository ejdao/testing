import { Plug } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function IntegracionesPage() {
  return (
    <ModulePlaceholder
      title="Integraciones"
      description="Conecta servicios externos y APIs de terceros al sistema."
      icon={Plug}
      parentModule="Configuracion / Conexiones"
    />
  )
}
