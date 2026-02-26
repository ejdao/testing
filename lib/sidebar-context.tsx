"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface SidebarContextType {
  collapsed: boolean
  setCollapsed: (v: boolean) => void
  mobileOpen: boolean
  setMobileOpen: (v: boolean) => void
  isMobile: boolean
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setMobileOpen(false)
      }
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, mobileOpen, setMobileOpen, isMobile }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
