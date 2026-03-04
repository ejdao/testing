"use client"

import { AppProviders } from "@/lib/store"

export function Providers({ children }: { children: React.ReactNode }) {
  return <AppProviders>{children}</AppProviders>
}
