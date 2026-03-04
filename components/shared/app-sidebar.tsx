"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/store"
import {
  Ambulance,
  Stethoscope,
  LogOut,
  Menu,
  X,
  Heart,
  Clock,
  Sun,
  Moon,
} from "lucide-react"
import { useState } from "react"

const NAV_ITEMS = [
  {
    href: "/dashboard/central",
    label: "Central de Ambulancias",
    icon: Ambulance,
    roles: ["central", "admin"],
  },
  {
    href: "/dashboard/enfermeria",
    label: "Enfermeria",
    icon: Stethoscope,
    roles: ["enfermera", "admin"],
  },
]

export function AppSidebar() {
  const { usuario, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const turnoIcon =
    usuario?.turno === "nocturno" ? (
      <Moon className="h-3.5 w-3.5" />
    ) : (
      <Sun className="h-3.5 w-3.5" />
    )

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setCollapsed(!collapsed)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-sidebar p-2 text-sidebar-foreground shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {collapsed ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {collapsed && (
        <div
          className="fixed inset-0 z-30 bg-foreground/50 lg:hidden"
          onClick={() => setCollapsed(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform lg:translate-x-0 ${
          collapsed ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-sidebar-border px-4 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            <Heart className="h-5 w-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-bold">Control Ambulancias</p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              Hospital San Jorge
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            Modulos
          </p>
          <ul className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href)
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <button
                    type="button"
                    onClick={() => {
                      router.push(item.href)
                      setCollapsed(false)
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0" />
                    {item.label}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* User info */}
        <div className="border-t border-sidebar-border px-3 py-4">
          <div className="mb-3 rounded-lg bg-sidebar-accent/50 px-3 py-2.5">
            <p className="text-sm font-semibold text-sidebar-foreground">
              {usuario?.nombre} {usuario?.apellido}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded bg-sidebar-primary/20 px-1.5 py-0.5 text-xs font-medium text-sidebar-primary">
                {usuario?.rol === "central" && "Central"}
                {usuario?.rol === "enfermera" && "Enfermera"}
                {usuario?.rol === "conductor" && "Conductor"}
                {usuario?.rol === "medico" && "Medico"}
              </span>
              {usuario?.servicio && (
                <span className="text-xs text-sidebar-foreground/60">
                  {usuario.servicio}
                </span>
              )}
            </div>
            {usuario?.turno && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-sidebar-foreground/50">
                {turnoIcon}
                <span>
                  Turno {usuario.turno === "diurno" ? "Diurno" : "Nocturno"}
                </span>
                <Clock className="ml-auto h-3 w-3" />
                <span>06:00 - 18:00</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesion
          </button>
        </div>
      </aside>
    </>
  )
}
