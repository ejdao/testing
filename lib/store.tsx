"use client"

import React, { createContext, useContext, useState, useCallback } from "react"
import type { Usuario, Traslado, Movil, EventoTimeline } from "./types"
import {
  MOCK_USUARIOS,
  MOCK_TRASLADOS,
  MOCK_MOVILES,
  MOCK_EVENTOS,
} from "./mock-data"

// ── Auth Context ──
interface AuthContextType {
  usuario: Usuario | null
  login: (usuario: Usuario) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)

  const login = useCallback((user: Usuario) => {
    setUsuario(user)
  }, [])

  const logout = useCallback(() => {
    setUsuario(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{ usuario, login, logout, isAuthenticated: !!usuario }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within AuthProvider")
  return context
}

// ── Traslados Context ──
interface TrasladosContextType {
  traslados: Traslado[]
  agregarTraslado: (traslado: Traslado) => void
  actualizarTraslado: (id: string, data: Partial<Traslado>) => void
  obtenerTraslado: (id: string) => Traslado | undefined
  trasladosPendientes: Traslado[]
  trasladosHoy: Traslado[]
  trasladosPorEnfermero: (enfermeroId: string) => Traslado[]
}

const TrasladosContext = createContext<TrasladosContextType | null>(null)

export function TrasladosProvider({ children }: { children: React.ReactNode }) {
  const [traslados, setTraslados] = useState<Traslado[]>(MOCK_TRASLADOS)

  const agregarTraslado = useCallback((traslado: Traslado) => {
    setTraslados((prev) => [traslado, ...prev])
  }, [])

  const actualizarTraslado = useCallback(
    (id: string, data: Partial<Traslado>) => {
      setTraslados((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...data } : t))
      )
    },
    []
  )

  const obtenerTraslado = useCallback(
    (id: string) => traslados.find((t) => t.id === id),
    [traslados]
  )

  const trasladosPendientes = traslados.filter(
    (t) => t.estado === "pendiente"
  )

  const trasladosHoy = traslados.filter((t) => {
    const hoy = new Date().toISOString().split("T")[0]
    return t.fechaSolicitud.startsWith(hoy) || t.fechaSolicitud.startsWith("2026-03-04")
  })

  const trasladosPorEnfermero = useCallback(
    (enfermeroId: string) =>
      traslados.filter((t) => t.enfermeroSolicitanteId === enfermeroId),
    [traslados]
  )

  return (
    <TrasladosContext.Provider
      value={{
        traslados,
        agregarTraslado,
        actualizarTraslado,
        obtenerTraslado,
        trasladosPendientes,
        trasladosHoy,
        trasladosPorEnfermero,
      }}
    >
      {children}
    </TrasladosContext.Provider>
  )
}

export function useTraslados() {
  const context = useContext(TrasladosContext)
  if (!context)
    throw new Error("useTraslados must be used within TrasladosProvider")
  return context
}

// ── Moviles Context ──
interface MovilesContextType {
  moviles: Movil[]
  actualizarMovil: (id: string, data: Partial<Movil>) => void
  obtenerMovil: (id: string) => Movil | undefined
  movilesDisponibles: Movil[]
}

const MovilesContext = createContext<MovilesContextType | null>(null)

export function MovilesProvider({ children }: { children: React.ReactNode }) {
  const [moviles, setMoviles] = useState<Movil[]>(MOCK_MOVILES)

  const actualizarMovil = useCallback(
    (id: string, data: Partial<Movil>) => {
      setMoviles((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...data } : m))
      )
    },
    []
  )

  const obtenerMovil = useCallback(
    (id: string) => moviles.find((m) => m.id === id),
    [moviles]
  )

  const movilesDisponibles = moviles.filter(
    (m) => m.estado === "disponible"
  )

  return (
    <MovilesContext.Provider
      value={{ moviles, actualizarMovil, obtenerMovil, movilesDisponibles }}
    >
      {children}
    </MovilesContext.Provider>
  )
}

export function useMoviles() {
  const context = useContext(MovilesContext)
  if (!context)
    throw new Error("useMoviles must be used within MovilesProvider")
  return context
}

// ── Eventos Context ──
interface EventosContextType {
  eventos: EventoTimeline[]
  agregarEvento: (evento: EventoTimeline) => void
  eventosPorTraslado: (trasladoId: string) => EventoTimeline[]
}

const EventosContext = createContext<EventosContextType | null>(null)

export function EventosProvider({ children }: { children: React.ReactNode }) {
  const [eventos, setEventos] = useState<EventoTimeline[]>(MOCK_EVENTOS)

  const agregarEvento = useCallback((evento: EventoTimeline) => {
    setEventos((prev) => [...prev, evento])
  }, [])

  const eventosPorTraslado = useCallback(
    (trasladoId: string) =>
      eventos
        .filter((e) => e.trasladoId === trasladoId)
        .sort(
          (a, b) =>
            new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
        ),
    [eventos]
  )

  return (
    <EventosContext.Provider
      value={{ eventos, agregarEvento, eventosPorTraslado }}
    >
      {children}
    </EventosContext.Provider>
  )
}

export function useEventos() {
  const context = useContext(EventosContext)
  if (!context)
    throw new Error("useEventos must be used within EventosProvider")
  return context
}

// ── Combined Provider ──
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <EventosProvider>
        <MovilesProvider>
          <TrasladosProvider>{children}</TrasladosProvider>
        </MovilesProvider>
      </EventosProvider>
    </AuthProvider>
  )
}

// ── Utility: get mock users ──
export function getMockUsuarios() {
  return MOCK_USUARIOS
}
