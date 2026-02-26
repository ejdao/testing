import { Users, Package, FileText, TrendingUp } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const stats = [
  {
    label: "Usuarios Activos",
    value: "1,248",
    change: "+12.5%",
    icon: Users,
    trend: "up" as const,
  },
  {
    label: "Productos",
    value: "856",
    change: "+3.2%",
    icon: Package,
    trend: "up" as const,
  },
  {
    label: "Documentos",
    value: "2,340",
    change: "+8.1%",
    icon: FileText,
    trend: "up" as const,
  },
  {
    label: "Ingresos",
    value: "$45.2k",
    change: "+15.3%",
    icon: TrendingUp,
    trend: "up" as const,
  },
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.label}
          className="border-border bg-card"
        >
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <stat.icon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">
                {stat.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-foreground">
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-emerald-600">
                  {stat.change}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
