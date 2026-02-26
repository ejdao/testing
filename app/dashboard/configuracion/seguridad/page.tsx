import { Shield } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function SeguridadPage() {
  return (
    <ModulePlaceholder
      title="Seguridad"
      description="Configura politicas de seguridad, autenticacion y auditorias."
      icon={Shield}
      parentModule="Configuracion / Sistema"
    />
  )
}
