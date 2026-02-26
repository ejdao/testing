import { Lock } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function PermisosPage() {
  return (
    <ModulePlaceholder
      title="Permisos"
      description="Configura permisos granulares para cada rol y usuario del sistema."
      icon={Lock}
      parentModule="Usuarios / Seguridad"
    />
  )
}
