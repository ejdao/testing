import { Settings } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function ConfigGeneralPage() {
  return (
    <ModulePlaceholder
      title="Configuracion General"
      description="Ajusta la configuracion general del sistema y preferencias."
      icon={Settings}
      parentModule="Configuracion / Sistema"
    />
  )
}
