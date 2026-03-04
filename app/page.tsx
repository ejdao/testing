"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, getMockUsuarios } from "@/lib/store"
import type { Rol } from "@/lib/types"
import {
  Ambulance,
  Stethoscope,
  Truck,
  ShieldCheck,
  LogIn,
  Heart,
} from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const { login } = useAuth()
  const [selectedRol, setSelectedRol] = useState<Rol | null>(null)
  const [error, setError] = useState("")

  const roles: { rol: Rol; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      rol: "central",
      label: "Central de Ambulancias",
      icon: <Ambulance className="h-8 w-8" />,
      desc: "Despacho y control de moviles",
    },
    {
      rol: "enfermera",
      label: "Enfermera Jefe",
      icon: <Stethoscope className="h-8 w-8" />,
      desc: "Solicitudes de traslado",
    },
    {
      rol: "conductor",
      label: "Conductor",
      icon: <Truck className="h-8 w-8" />,
      desc: "Operacion de movil",
    },
    {
      rol: "medico",
      label: "Medico",
      icon: <ShieldCheck className="h-8 w-8" />,
      desc: "Acompanamiento medico",
    },
  ]

  const handleLogin = () => {
    if (!selectedRol) {
      setError("Seleccione un rol para ingresar")
      return
    }

    const usuarios = getMockUsuarios()
    const usuario = usuarios.find((u) => u.rol === selectedRol)
    if (usuario) {
      login(usuario)
      if (selectedRol === "central") {
        router.push("/dashboard/central")
      } else if (selectedRol === "enfermera") {
        router.push("/dashboard/enfermeria")
      } else {
        router.push("/dashboard/central")
      }
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Heart className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sistema de Control de Ambulancias
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Hospital Universitario San Jorge - Central de Despacho
          </p>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-semibold text-card-foreground">
            Iniciar Sesion
          </h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Seleccione su rol para acceder al sistema
          </p>

          {/* Role selector */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            {roles.map((r) => (
              <button
                key={r.rol}
                type="button"
                onClick={() => {
                  setSelectedRol(r.rol)
                  setError("")
                }}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-center transition-all hover:shadow-md ${
                  selectedRol === r.rol
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                <div
                  className={`rounded-lg p-2 ${
                    selectedRol === r.rol
                      ? "bg-primary/10"
                      : "bg-muted"
                  }`}
                >
                  {r.icon}
                </div>
                <span className="text-sm font-medium">{r.label}</span>
                <span className="text-xs text-muted-foreground">{r.desc}</span>
              </button>
            ))}
          </div>

          {/* Selected user info */}
          {selectedRol && (
            <div className="mb-4 rounded-lg bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Ingresando como:
              </p>
              <p className="text-sm font-semibold text-foreground">
                {getMockUsuarios().find((u) => u.rol === selectedRol)?.nombre}{" "}
                {getMockUsuarios().find((u) => u.rol === selectedRol)?.apellido}
              </p>
              {getMockUsuarios().find((u) => u.rol === selectedRol)?.servicio && (
                <p className="text-xs text-muted-foreground">
                  Servicio:{" "}
                  {getMockUsuarios().find((u) => u.rol === selectedRol)?.servicio}
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mb-4 text-center text-sm text-destructive">{error}</p>
          )}

          {/* Login button */}
          <button
            type="button"
            onClick={handleLogin}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            <LogIn className="h-4 w-4" />
            Ingresar al Sistema
          </button>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sistema de Regulacion de Ambulancias v1.0 - Modo demostracion
        </p>
      </div>
    </div>
  )
}

export default function Page() {
  return <LoginForm />
}
