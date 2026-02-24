"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { BedDouble, ClipboardList, Activity } from "lucide-react"

const navItems = [
  { href: "/", label: "Pacientes", icon: BedDouble },
  { href: "/gestiones", label: "Gestiones", icon: ClipboardList },
]

export function AppNav() {
  const pathname = usePathname()

  return (
    <header className="border-b bg-card">
      <div className="flex items-center justify-between px-6 h-14">
        <div className="flex items-center gap-2">
          <Activity className="size-5 text-primary" />
          <span className="font-semibold text-foreground">
            Sistema de Gestion Clinica
          </span>
        </div>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
