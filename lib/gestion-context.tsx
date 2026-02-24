"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import type { Gestion, Patient, Observation, AmbulanceTripStatus } from "./types"
import { mockPatients, mockGestiones } from "./mock-data"

interface GestionContextType {
  patients: Patient[]
  gestiones: Gestion[]
  addGestion: (gestion: Gestion) => void
  updateGestionStatus: (gestionId: string, newStatus: string) => void
  addObservation: (gestionId: string, observation: Observation) => void
  assignDriver: (gestionId: string, tripId: string, driver: string) => void
  updateTripStatus: (gestionId: string, tripId: string, newStatus: AmbulanceTripStatus) => void
  getGestionesByPatient: (patientId: string) => Gestion[]
}

const GestionContext = createContext<GestionContextType | null>(null)

export function GestionProvider({ children }: { children: ReactNode }) {
  const [patients] = useState<Patient[]>(mockPatients)
  const [gestiones, setGestiones] = useState<Gestion[]>(mockGestiones)

  const addGestion = useCallback((gestion: Gestion) => {
    setGestiones((prev) => [...prev, gestion])
  }, [])

  const updateGestionStatus = useCallback((gestionId: string, newStatus: string) => {
    setGestiones((prev) =>
      prev.map((g) => (g.id === gestionId ? { ...g, status: newStatus } : g))
    )
  }, [])

  const addObservation = useCallback((gestionId: string, observation: Observation) => {
    setGestiones((prev) =>
      prev.map((g) =>
        g.id === gestionId
          ? { ...g, observations: [...g.observations, observation] }
          : g
      )
    )
  }, [])

  const assignDriver = useCallback(
    (gestionId: string, tripId: string, driver: string) => {
      setGestiones((prev) =>
        prev.map((g) => {
          if (g.id !== gestionId || !g.ambulanceTransfer) return g
          return {
            ...g,
            ambulanceTransfer: {
              ...g.ambulanceTransfer,
              trips: g.ambulanceTransfer.trips.map((t) =>
                t.id === tripId ? { ...t, driver, status: "ASIGNADO" as const } : t
              ),
            },
            status: "ASIGNADO",
          }
        })
      )
    },
    []
  )

  const updateTripStatus = useCallback(
    (gestionId: string, tripId: string, newStatus: AmbulanceTripStatus) => {
      setGestiones((prev) =>
        prev.map((g) => {
          if (g.id !== gestionId || !g.ambulanceTransfer) return g

          const updatedTrips = g.ambulanceTransfer.trips.map((t) =>
            t.id === tripId ? { ...t, status: newStatus } : t
          )

          // If trip is finalized and transfer is round trip, check if we need to create return trip
          if (
            newStatus === "FINALIZADO" &&
            g.ambulanceTransfer.transferType === "REDONDO"
          ) {
            const currentTrip = g.ambulanceTransfer.trips.find((t) => t.id === tripId)
            const maxTripNumber = Math.max(...updatedTrips.map((t) => t.tripNumber))

            // Only create return trip if this is trip 1 and trip 2 doesn't exist
            if (currentTrip && currentTrip.tripNumber === 1 && maxTripNumber < 2) {
              updatedTrips.push({
                id: `trip-${Date.now()}`,
                tripNumber: 2,
                status: "PENDIENTE",
                driver: null,
                origin: g.ambulanceTransfer.destination.place,
                destination: g.ambulanceTransfer.origin.place,
              })
            }
          }

          // Determine overall gestion status based on trips
          const allFinalized = updatedTrips.every((t) => t.status === "FINALIZADO")
          const anyStarted = updatedTrips.some((t) => t.status === "INICIADO")
          const anyAssigned = updatedTrips.some((t) => t.status === "ASIGNADO")
          const anyPending = updatedTrips.some((t) => t.status === "PENDIENTE")

          let overallStatus = g.status
          if (allFinalized) overallStatus = "FINALIZADO"
          else if (anyStarted) overallStatus = "INICIADO"
          else if (anyAssigned) overallStatus = "ASIGNADO"
          else if (anyPending) overallStatus = "PENDIENTE"

          return {
            ...g,
            ambulanceTransfer: {
              ...g.ambulanceTransfer,
              trips: updatedTrips,
            },
            status: overallStatus,
          }
        })
      )
    },
    []
  )

  const getGestionesByPatient = useCallback(
    (patientId: string) => {
      return gestiones.filter((g) => g.patientId === patientId)
    },
    [gestiones]
  )

  return (
    <GestionContext.Provider
      value={{
        patients,
        gestiones,
        addGestion,
        updateGestionStatus,
        addObservation,
        assignDriver,
        updateTripStatus,
        getGestionesByPatient,
      }}
    >
      {children}
    </GestionContext.Provider>
  )
}

export function useGestion() {
  const context = useContext(GestionContext)
  if (!context) {
    throw new Error("useGestion must be used within a GestionProvider")
  }
  return context
}
