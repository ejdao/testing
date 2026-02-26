"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { clinics, type Clinic } from "@/lib/navigation"

interface ClinicContextType {
  currentClinic: Clinic
  setCurrentClinic: (clinic: Clinic) => void
  allClinics: Clinic[]
}

const ClinicContext = createContext<ClinicContextType | null>(null)

export function ClinicProvider({ children }: { children: ReactNode }) {
  const [currentClinic, setCurrentClinic] = useState<Clinic>(clinics[0])

  return (
    <ClinicContext.Provider
      value={{
        currentClinic,
        setCurrentClinic,
        allClinics: clinics,
      }}
    >
      {children}
    </ClinicContext.Provider>
  )
}

export function useClinic() {
  const context = useContext(ClinicContext)
  if (!context) {
    throw new Error("useClinic must be used within a ClinicProvider")
  }
  return context
}
