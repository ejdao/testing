import { HelpCircle } from "lucide-react"
import { ModulePlaceholder } from "@/components/module-placeholder"

export default function SoportePage() {
  return (
    <ModulePlaceholder
      title="Soporte"
      description="Centro de ayuda, documentacion y contacto con soporte tecnico."
      icon={HelpCircle}
      parentModule=""
    />
  )
}
