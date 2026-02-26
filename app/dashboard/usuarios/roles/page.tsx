import { ShieldCheck } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function RolesPage() {
  return (
    <ModulePlaceholder
      title="Roles"
      description="Administra los roles de usuario y sus niveles de acceso en el sistema."
      icon={ShieldCheck}
      parentModule="Usuarios / Seguridad"
    />
  )
}
