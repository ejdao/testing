"use client"

import { useState } from "react"
import { useGestion } from "@/lib/gestion-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Play,
  CheckCircle,
  Plus,
  UserPlus,
  Truck,
  MapPin,
  Clock,
  AlertTriangle,
  Shield,
} from "lucide-react"
import type { Gestion, AmbulanceTrip } from "@/lib/types"

function getStatusBadge(status: string) {
  const styles: Record<string, string> = {
    INICIADO: "bg-blue-100 text-blue-800",
    EN_PROCESO: "bg-amber-100 text-amber-800",
    FINALIZADO: "bg-emerald-100 text-emerald-800",
    PENDIENTE: "bg-slate-100 text-slate-800",
    ASIGNADO: "bg-indigo-100 text-indigo-800",
  }
  return styles[status] || "bg-muted text-muted-foreground"
}

function getPriorityBadge(priority: string) {
  const styles: Record<string, string> = {
    BAJA: "bg-blue-100 text-blue-800",
    MEDIA: "bg-amber-100 text-amber-800",
    ALTA: "bg-orange-100 text-orange-800",
    CRITICA: "bg-red-100 text-red-100",
  }
  return styles[priority] || "bg-muted text-muted-foreground"
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ")
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return d.toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

interface GestionDetailDialogProps {
  gestion: Gestion
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GestionDetailDialog({
  gestion,
  open,
  onOpenChange,
}: GestionDetailDialogProps) {
  const {
    updateGestionStatus,
    addObservation,
    assignDriver,
    updateTripStatus,
    gestiones,
  } = useGestion()

  // Always get the latest version of the gestion from context
  const currentGestion = gestiones.find((g) => g.id === gestion.id) || gestion

  const [newObservation, setNewObservation] = useState("")
  const [driverName, setDriverName] = useState("")
  const [assigningTripId, setAssigningTripId] = useState<string | null>(null)

  const isNormal = currentGestion.type === "NORMAL"
  const isAmbulance = currentGestion.type === "TRASLADO_AMBULANCIA"
  const isFinalized = currentGestion.status === "FINALIZADO"

  // Normal gestion actions
  const handleStartProcess = () => {
    updateGestionStatus(currentGestion.id, "EN_PROCESO")
  }

  const handleFinalize = () => {
    updateGestionStatus(currentGestion.id, "FINALIZADO")
  }

  const handleAddObservation = () => {
    if (!newObservation.trim()) return
    addObservation(currentGestion.id, {
      id: `obs-${Date.now()}`,
      text: newObservation,
      createdAt: new Date().toISOString(),
      author: "Usuario",
    })
    setNewObservation("")
  }

  // Ambulance actions
  const handleAssignDriver = (tripId: string) => {
    if (!driverName.trim()) return
    assignDriver(currentGestion.id, tripId, driverName)
    setDriverName("")
    setAssigningTripId(null)
  }

  const handleStartTrip = (tripId: string) => {
    updateTripStatus(currentGestion.id, tripId, "INICIADO")
  }

  const handleFinalizeTrip = (tripId: string) => {
    updateTripStatus(currentGestion.id, tripId, "FINALIZADO")
  }

  const getTripActions = (trip: AmbulanceTrip) => {
    switch (trip.status) {
      case "PENDIENTE":
        return (
          <div className="flex flex-col gap-2">
            {assigningTripId === trip.id ? (
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Nombre del conductor"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  className="h-8 text-sm"
                />
                <Button
                  size="sm"
                  onClick={() => handleAssignDriver(trip.id)}
                  disabled={!driverName.trim()}
                >
                  Asignar
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setAssigningTripId(null)
                    setDriverName("")
                  }}
                >
                  Cancelar
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAssigningTripId(trip.id)}
                className="gap-1.5"
              >
                <UserPlus className="size-3.5" />
                Asignar Conductor
              </Button>
            )}
          </div>
        )
      case "ASIGNADO":
        return (
          <Button size="sm" onClick={() => handleStartTrip(trip.id)} className="gap-1.5">
            <Play className="size-3.5" />
            Iniciar Recorrido
          </Button>
        )
      case "INICIADO":
        return (
          <Button size="sm" onClick={() => handleFinalizeTrip(trip.id)} className="gap-1.5">
            <CheckCircle className="size-3.5" />
            Finalizar Recorrido
          </Button>
        )
      case "FINALIZADO":
        return (
          <span className="inline-flex items-center text-xs text-emerald-700 font-medium gap-1">
            <CheckCircle className="size-3.5" />
            Completado
          </span>
        )
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span className="font-mono text-sm bg-muted px-2 py-1 rounded">
              {currentGestion.code}
            </span>
            {currentGestion.title}
          </DialogTitle>
          <DialogDescription>
            Paciente: {currentGestion.patientName} | Area: {currentGestion.area}
          </DialogDescription>
        </DialogHeader>

        {/* Status and info bar */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-lg bg-muted/30 border">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Estado:</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadge(currentGestion.status)}`}
            >
              {formatStatus(currentGestion.status)}
            </span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Prioridad:</span>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getPriorityBadge(currentGestion.priority)}`}
            >
              {currentGestion.priority}
            </span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Tipo:</span>
            <Badge variant="outline" className="text-xs">
              {isAmbulance ? "Traslado Ambulancia" : "Normal"}
            </Badge>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <div className="flex items-center gap-2">
            <Clock className="size-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {formatDate(currentGestion.createdAt)}
            </span>
          </div>
        </div>

        {/* Observation from creation */}
        {currentGestion.observation && (
          <div className="p-3 rounded-lg border bg-muted/20">
            <p className="text-xs text-muted-foreground mb-1">Observacion inicial:</p>
            <p className="text-sm">{currentGestion.observation}</p>
          </div>
        )}

        {/* Normal Gestion Management */}
        {isNormal && (
          <div className="flex flex-col gap-4">
            {/* Status Actions */}
            {!isFinalized && (
              <div className="flex items-center gap-3">
                {currentGestion.status === "INICIADO" && (
                  <Button onClick={handleStartProcess} className="gap-1.5">
                    <Play className="size-3.5" />
                    Pasar a En Proceso
                  </Button>
                )}
                {currentGestion.status === "EN_PROCESO" && (
                  <Button onClick={handleFinalize} className="gap-1.5">
                    <CheckCircle className="size-3.5" />
                    Finalizar Gestion
                  </Button>
                )}
              </div>
            )}

            <Separator />

            {/* Observations */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold">Observaciones</h3>

              {currentGestion.observations.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                  {currentGestion.observations.map((obs) => (
                    <div
                      key={obs.id}
                      className="p-3 rounded-lg border bg-card text-sm"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-xs">{obs.author}</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(obs.createdAt)}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{obs.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground py-3 text-center border rounded-lg bg-muted/20">
                  No hay observaciones registradas
                </p>
              )}

              {/* Add observation - only when not finalized */}
              {!isFinalized && (
                <div className="flex items-start gap-2">
                  <Textarea
                    placeholder="Agregar observacion..."
                    value={newObservation}
                    onChange={(e) => setNewObservation(e.target.value)}
                    rows={2}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleAddObservation}
                    disabled={!newObservation.trim()}
                    size="sm"
                    className="gap-1.5 mt-1"
                  >
                    <Plus className="size-3.5" />
                    Agregar
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ambulance Transfer Management */}
        {isAmbulance && currentGestion.ambulanceTransfer && (
          <div className="flex flex-col gap-4">
            {/* Transfer Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg border bg-muted/20">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Truck className="size-3" />
                  Tipo de traslado
                </div>
                <p className="text-sm font-medium">
                  {currentGestion.ambulanceTransfer.transferType === "REDONDO"
                    ? "Redondo"
                    : "Simple"}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="size-3" />
                  Fecha programada
                </div>
                <p className="text-sm font-medium">
                  {formatDate(currentGestion.ambulanceTransfer.dateTime)}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  Origen
                </div>
                <p className="text-sm font-medium">
                  {currentGestion.ambulanceTransfer.origin.place}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentGestion.ambulanceTransfer.origin.address},{" "}
                  {currentGestion.ambulanceTransfer.origin.municipality},{" "}
                  {currentGestion.ambulanceTransfer.origin.department}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  Destino
                </div>
                <p className="text-sm font-medium">
                  {currentGestion.ambulanceTransfer.destination.place}
                </p>
                <p className="text-xs text-muted-foreground">
                  {currentGestion.ambulanceTransfer.destination.address},{" "}
                  {currentGestion.ambulanceTransfer.destination.municipality},{" "}
                  {currentGestion.ambulanceTransfer.destination.department}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Servicio destino</span>
                <p className="text-sm font-medium">
                  {currentGestion.ambulanceTransfer.destinationService}
                </p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Motivo</span>
                <p className="text-sm font-medium">{currentGestion.ambulanceTransfer.reason}</p>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">Soporte vital</span>
                <div className="flex flex-wrap gap-1.5">
                  {currentGestion.ambulanceTransfer.vitalSupport.infusionPump && (
                    <Badge variant="secondary" className="text-xs">Bomba Infusion</Badge>
                  )}
                  {currentGestion.ambulanceTransfer.vitalSupport.mechanicalVentilator && (
                    <Badge variant="secondary" className="text-xs">Ventilador Mecanico</Badge>
                  )}
                  {!currentGestion.ambulanceTransfer.vitalSupport.infusionPump &&
                    !currentGestion.ambulanceTransfer.vitalSupport.mechanicalVentilator && (
                      <span className="text-xs text-muted-foreground">Ninguno</span>
                    )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">EPP</span>
                <div className="flex items-center gap-1.5">
                  {currentGestion.ambulanceTransfer.requiresEPP ? (
                    <>
                      <AlertTriangle className="size-3 text-amber-600" />
                      <span className="text-sm font-medium text-amber-700">Requerido</span>
                    </>
                  ) : (
                    <>
                      <Shield className="size-3 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700">No requerido</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {currentGestion.ambulanceTransfer.observation && (
              <div className="p-3 rounded-lg border bg-muted/20">
                <p className="text-xs text-muted-foreground mb-1">Observacion del traslado:</p>
                <p className="text-sm">{currentGestion.ambulanceTransfer.observation}</p>
              </div>
            )}

            <Separator />

            {/* Trips */}
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Truck className="size-4" />
                Recorridos
                {currentGestion.ambulanceTransfer.transferType === "REDONDO" && (
                  <Badge variant="outline" className="text-xs">Traslado Redondo</Badge>
                )}
              </h3>

              {currentGestion.ambulanceTransfer.trips.map((trip) => (
                <div
                  key={trip.id}
                  className="p-4 rounded-lg border bg-card flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">
                        Recorrido #{trip.tripNumber}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusBadge(trip.status)}`}
                      >
                        {formatStatus(trip.status)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {trip.origin}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3" />
                      {trip.destination}
                    </span>
                  </div>

                  {trip.driver && (
                    <p className="text-sm">
                      <span className="text-muted-foreground">Conductor: </span>
                      <span className="font-medium">{trip.driver}</span>
                    </p>
                  )}

                  <div>{getTripActions(trip)}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
