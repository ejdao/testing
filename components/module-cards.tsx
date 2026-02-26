"use client"

import Link from "next/link"
import { ChevronRight, ArrowRight } from "lucide-react"
import { navigationItems, type NavModule, type NavLink } from "@/lib/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

function ModuleCard({ item }: { item: NavModule }) {
  const firstRoute = item.submodules[0]?.routes[0]?.href ?? "/dashboard"
  const totalRoutes = item.submodules.reduce((acc, sub) => acc + sub.routes.length, 0)

  return (
    <Card className="group relative overflow-hidden border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <item.icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-card-foreground">
              {item.label}
            </CardTitle>
            <Badge variant="secondary" className="mt-1 text-[10px] font-normal">
              {totalRoutes} {totalRoutes === 1 ? "ruta" : "rutas"}
            </Badge>
          </div>
        </div>
        <Link
          href={firstRoute}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          aria-label={`Ir a ${item.label}`}
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CardHeader>
      <CardContent className="pt-0">
        {item.description && (
          <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
            {item.description}
          </p>
        )}
        <div className="flex flex-col gap-2">
          {item.submodules.map((sub) => (
            <div key={sub.label}>
              <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                {sub.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {sub.routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    <span>{route.label}</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function LinkCard({ item }: { item: NavLink }) {
  return (
    <Link href={item.href}>
      <Card className="group h-full border-border bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
        <CardHeader className="flex flex-row items-center gap-3 pb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <item.icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-sm font-semibold text-card-foreground">
              {item.label}
            </CardTitle>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
        </CardHeader>
        {item.description && (
          <CardContent className="pt-0">
            <p className="text-xs leading-relaxed text-muted-foreground">
              {item.description}
            </p>
          </CardContent>
        )}
      </Card>
    </Link>
  )
}

export function ModuleCards() {
  const modules = navigationItems.filter(
    (item) => item.type === "module"
  ) as NavModule[]
  const links = navigationItems.filter(
    (item) => item.type === "link" && item.href !== "/dashboard"
  ) as NavLink[]

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Modulos
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modules.map((item) => (
            <ModuleCard key={item.label} item={item} />
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold text-foreground">
          Enlaces
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {links.map((item) => (
            <LinkCard key={item.label} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}
