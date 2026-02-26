"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  LayoutGrid,
  X,
  Building2,
  ChevronsUpDown,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { navigationItems, type NavItem, type NavModule } from "@/lib/navigation"
import { useSidebar } from "@/lib/sidebar-context"
import { useClinic } from "@/lib/clinic-context"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function Sidebar() {
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile } = useSidebar()
  const { currentClinic, setCurrentClinic, allClinics } = useClinic()
  const [openModules, setOpenModules] = useState<string[]>([])
  const [openSubmodules, setOpenSubmodules] = useState<string[]>([])
  const [clinicPopoverOpen, setClinicPopoverOpen] = useState(false)
  const pathname = usePathname()

  const isVisible = isMobile ? mobileOpen : true
  const showCollapsed = !isMobile && collapsed

  function toggleModule(label: string) {
    setOpenModules((prev) => {
      if (prev.includes(label)) {
        return []
      }
      // Accordion: close all other modules and their submodules
      setOpenSubmodules([])
      return [label]
    })
  }

  function toggleSubmodule(key: string) {
    const parentModule = key.split("::")[0]
    setOpenSubmodules((prev) => {
      if (prev.includes(key)) {
        return prev.filter((s) => s !== key)
      }
      // Accordion: only one submodule open per module
      const filtered = prev.filter((s) => !s.startsWith(`${parentModule}::`))
      return [...filtered, key]
    })
  }

  function isActive(href: string) {
    return pathname === href
  }

  function isModuleActive(item: NavModule) {
    return item.submodules.some((sub) =>
      sub.routes.some((r) => pathname === r.href)
    )
  }

  function isSubmoduleActive(moduleLabel: string, subLabel: string) {
    const mod = navigationItems.find(
      (n) => n.type === "module" && n.label === moduleLabel
    ) as NavModule | undefined
    if (!mod) return false
    const sub = mod.submodules.find((s) => s.label === subLabel)
    return sub ? sub.routes.some((r) => pathname === r.href) : false
  }

  function handleLinkClick() {
    if (isMobile) setMobileOpen(false)
  }

  const sidebarContent = (
    <aside
      className={cn(
        "flex h-full flex-col bg-sidebar transition-all duration-300",
        isMobile ? "w-[280px]" : showCollapsed ? "w-[68px]" : "w-[270px]"
      )}
    >
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-sidebar-border px-4">
        {!showCollapsed && (
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5"
            onClick={handleLinkClick}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sidebar-primary">
              <LayoutGrid className="h-3.5 w-3.5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-sidebar-foreground">
              AdminPanel
            </span>
          </Link>
        )}
        {isMobile ? (
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            aria-label="Cerrar menu"
          >
            <X className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              showCollapsed && "mx-auto"
            )}
            aria-label={collapsed ? "Expandir menu" : "Colapsar menu"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {/* Clinic Selector */}
      {!showCollapsed ? (
        <div className="shrink-0 border-b border-sidebar-border px-3 py-2.5">
          <Popover open={clinicPopoverOpen} onOpenChange={setClinicPopoverOpen}>
            <PopoverTrigger asChild>
              <button className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors hover:bg-sidebar-accent">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary/20 text-sidebar-primary">
                  <Building2 className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="truncate text-xs font-medium text-sidebar-foreground">
                    {currentClinic.name}
                  </p>
                  <p className="truncate text-[10px] text-sidebar-foreground/50">
                    {currentClinic.address}
                  </p>
                </div>
                <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 text-sidebar-foreground/40" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              side="right"
              align="start"
              className="w-[240px] p-1.5"
            >
              <p className="px-2 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">
                Seleccionar clinica
              </p>
              {allClinics.map((clinic) => (
                <button
                  key={clinic.id}
                  onClick={() => {
                    setCurrentClinic(clinic)
                    setClinicPopoverOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left text-sm transition-colors hover:bg-secondary",
                    currentClinic.id === clinic.id && "bg-secondary"
                  )}
                >
                  <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-xs font-medium text-foreground">
                      {clinic.name}
                    </p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {clinic.address}
                    </p>
                  </div>
                  {currentClinic.id === clinic.id && (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>
      ) : (
        <div className="shrink-0 border-b border-sidebar-border px-2 py-2.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex h-8 w-full items-center justify-center rounded-md bg-sidebar-primary/20 text-sidebar-primary">
                <Building2 className="h-4 w-4" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="text-xs">
              {currentClinic.name}
            </TooltipContent>
          </Tooltip>
        </div>
      )}

      {/* Navigation */}
      <nav className="sidebar-scroll flex-1 overflow-y-auto px-2 py-2">
        <div className="flex flex-col gap-0.5">
          {navigationItems.map((item) => {
            if (item.type === "link") {
              return renderLink(item)
            }
            return renderModule(item)
          })}
        </div>
      </nav>

      {/* Footer */}
      {!showCollapsed && (
        <div className="shrink-0 border-t border-sidebar-border px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sidebar-primary text-[10px] font-bold text-sidebar-primary-foreground">
              A
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-xs font-medium text-sidebar-foreground">
                Admin User
              </span>
              <span className="truncate text-[10px] text-sidebar-foreground/50">
                admin@panel.com
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  )

  function renderLink(item: NavItem & { type: "link" }) {
    const active = isActive(item.href)
    const linkEl = (
      <Link
        key={item.label}
        href={item.href}
        onClick={handleLinkClick}
        className={cn(
          "flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
          active
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground",
          showCollapsed && "justify-center px-0"
        )}
      >
        <item.icon className="h-[17px] w-[17px] shrink-0" />
        {!showCollapsed && <span>{item.label}</span>}
      </Link>
    )

    if (showCollapsed) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>{linkEl}</TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {item.label}
          </TooltipContent>
        </Tooltip>
      )
    }
    return linkEl
  }

  function renderModule(item: NavModule) {
    const isOpen = openModules.includes(item.label)
    const moduleActive = isModuleActive(item)

    if (showCollapsed) {
      return (
        <Tooltip key={item.label}>
          <TooltipTrigger asChild>
            <button
              onClick={() => {
                setCollapsed(false)
                if (!openModules.includes(item.label)) {
                  toggleModule(item.label)
                }
              }}
              className={cn(
                "flex w-full items-center justify-center rounded-lg py-2 text-[13px] font-medium transition-colors",
                moduleActive
                  ? "bg-sidebar-primary/20 text-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}
            >
              <item.icon className="h-[17px] w-[17px] shrink-0" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="text-xs">
            {item.label}
          </TooltipContent>
        </Tooltip>
      )
    }

    return (
      <div key={item.label}>
        <button
          onClick={() => toggleModule(item.label)}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
            moduleActive
              ? "bg-sidebar-primary/20 text-sidebar-primary"
              : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          )}
        >
          <item.icon className="h-[17px] w-[17px] shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
        </button>

        {isOpen && (
          <div className="ml-3 mt-0.5 border-l border-sidebar-border pl-2.5">
            {item.submodules.map((sub) => {
              const subKey = `${item.label}::${sub.label}`
              const subOpen = openSubmodules.includes(subKey)
              const subActive = isSubmoduleActive(item.label, sub.label)

              return (
                <div key={subKey} className="mb-0.5">
                  <button
                    onClick={() => toggleSubmodule(subKey)}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors",
                      subActive
                        ? "text-sidebar-primary"
                        : "text-sidebar-foreground/55 hover:text-sidebar-foreground/80"
                    )}
                  >
                    <span className="flex-1 text-left">{sub.label}</span>
                    {subOpen ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>

                  {subOpen && (
                    <div className="ml-2 border-l border-sidebar-border/60 pl-2">
                      {sub.routes.map((route) => {
                        const routeActive = isActive(route.href)
                        return (
                          <Link
                            key={route.href}
                            href={route.href}
                            onClick={handleLinkClick}
                            className={cn(
                              "block rounded-md px-2.5 py-1.5 text-[12px] transition-colors",
                              routeActive
                                ? "bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                                : "text-sidebar-foreground/50 hover:bg-sidebar-accent hover:text-sidebar-foreground/80"
                            )}
                          >
                            {route.label}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  if (!isVisible) return null

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile backdrop overlay */}
      {isMobile && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar wrapper */}
      <div
        className={cn(
          isMobile
            ? "fixed inset-y-0 left-0 z-50"
            : "relative shrink-0"
        )}
      >
        {sidebarContent}
      </div>
    </TooltipProvider>
  )
}
