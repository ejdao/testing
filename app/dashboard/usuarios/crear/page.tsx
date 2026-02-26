import { ModulePlaceholder } from "@/components/module-placeholder"
import { Users } from "lucide-react"

export default function CrearUsuarioPage() {
  return (
    <ModulePlaceholder
      title="Crear Usuario"
      description="Formulario para registrar nuevos usuarios en el sistema."
      icon={Users}
      parentModule="Usuarios / Gestion"
    />
  )
}
