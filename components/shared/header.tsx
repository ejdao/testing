"use client"

import { useAuth } from "@/lib/store"
import { Bell, Search } from "lucide-react"

export function DashboardHeader({ title }: { title: string }) {
  const { usuario } = useAuth()

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card px-6 py-3">
      <div className="flex items-center gap-4 pl-10 lg:pl-0">
        <h1 className="text-lg font-bold text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar traslado, paciente..."
            className="h-9 w-64 rounded-lg border border-input bg-background pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {usuario?.nombre?.charAt(0)}
            {usuario?.apellido?.charAt(0)}
          </div>
        </div>
      </div>
    </header>
  )
}
