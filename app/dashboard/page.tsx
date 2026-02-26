import { StatsCards } from "@/components/stats-cards"
import { ModuleCards } from "@/components/module-cards"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground text-balance">
          Bienvenido, Administrador
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Aqui tienes un resumen general de tu sistema.
        </p>
      </div>

      {/* Stats */}
      <StatsCards />

      {/* Module & Link Cards */}
      <ModuleCards />
    </div>
  )
}
