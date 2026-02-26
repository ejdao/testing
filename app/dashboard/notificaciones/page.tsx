import { Bell } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function NotificacionesPage() {
  return (
    <ModulePlaceholder
      title="Notificaciones"
      description="Revisa y administra todas las notificaciones del sistema."
      icon={Bell}
      parentModule=""
    />
  )
}
