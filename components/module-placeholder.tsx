import { Construction } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"

interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
  parentModule?: string
}

export function ModulePlaceholder({
  title,
  description,
  icon: Icon,
  parentModule,
}: ModulePlaceholderProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        {parentModule && (
          <span className="text-xs font-medium uppercase tracking-wider text-primary">
            {parentModule}
          </span>
        )}
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <Card className="border-border">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-foreground">
            {title}
          </h2>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            {description}
          </p>
          <div className="mt-6 flex items-center gap-2 rounded-full bg-secondary px-4 py-2 text-xs text-muted-foreground">
            <Construction className="h-3.5 w-3.5" />
            <span>Modulo en desarrollo</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
