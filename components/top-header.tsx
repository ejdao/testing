"use client"

import { Bell, Search, ChevronRight, Menu, Building2, LogOut } from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSidebar } from "@/lib/sidebar-context"
import { useClinic } from "@/lib/clinic-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function generateBreadcrumbs(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)
  const crumbs: { label: string; href: string }[] = []
  let path = ""
  for (const segment of segments) {
    path += `/${segment}`
    crumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1),
      href: path,
    })
  }
  return crumbs
}

export function TopHeader() {
  const pathname = usePathname()
  const breadcrumbs = generateBreadcrumbs(pathname)
  const { setMobileOpen, isMobile } = useSidebar()
  const { currentClinic } = useClinic()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      {/* Left side */}
      <div className="flex items-center gap-3">
        {isMobile && (
          <button
            onClick={() => setMobileOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}

        {/* Breadcrumb - hidden on small screens */}
        <nav
          className="hidden items-center gap-1 text-sm sm:flex"
          aria-label="Breadcrumb"
        >
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.href} className="flex items-center gap-1">
              {index > 0 && (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="font-medium text-foreground text-xs">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                >
                  {crumb.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Clinic indicator */}
        <div className="hidden items-center gap-2 rounded-lg border border-border bg-secondary/50 px-3 py-1.5 md:flex">
          <Building2 className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">
            {currentClinic.name}
          </span>
        </div>

        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar..."
            className="h-8 w-[200px] bg-secondary pl-9 text-xs"
          />
        </div>

        <button className="relative flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground">
          <Bell className="h-4 w-4" />
          <Badge className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
            3
          </Badge>
          <span className="sr-only">Notificaciones</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-lg px-2 py-1 transition-colors hover:bg-secondary">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary text-[10px] font-semibold text-primary-foreground">
                  AU
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-xs font-medium text-foreground lg:block">
                Admin Usuario
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium text-foreground">
                Admin Usuario
              </p>
              <p className="text-xs text-muted-foreground">
                admin@panel.com
              </p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={() => {
                // Placeholder: redirect to login or call auth logout
                window.location.href = "/"
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
