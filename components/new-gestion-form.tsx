"use client"

import { useState } from "react"
import { useGestion } from "@/lib/gestion-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AmbulanceTransferForm } from "@/components/ambulance-transfer-form"
import type { Patient, Priority, GestionType, Gestion, AmbulanceTransfer } from "@/lib/types"

interface NewGestionFormProps {
  patient: Patient
  onSuccess: () => void
  onCancel: () => void
}

export function NewGestionForm({ patient, onSuccess, onCancel }: NewGestionFormProps) {
  const { addGestion, gestiones } = useGestion()
  const [title, setTitle] = useState("")
  const [observation, setObservation] = useState("")
  const [priority, setPriority] = useState<Priority | "">("")
  const [gestionType, setGestionType] = useState<GestionType | "">("")
  const [area, setArea] = useState("")
  const [ambulanceData, setAmbulanceData] = useState<AmbulanceTransfer | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!title.trim()) newErrors.title = "El titulo es requerido"
    if (!priority) newErrors.priority = "La prioridad es requerida"
    if (!gestionType) newErrors.gestionType = "El tipo de gestion es requerido"
    if (!area.trim()) newErrors.area = "El area es requerida"
    if (gestionType === "TRASLADO_AMBULANCIA" && !ambulanceData) {
      newErrors.ambulance = "Complete el formulario de traslado"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const code = `GC-2026-${String(gestiones.length + 1).padStart(3, "0")}`
    const isAmbulance = gestionType === "TRASLADO_AMBULANCIA"

    const newGestion: Gestion = {
      id: `g-${Date.now()}`,
      code,
      patientId: patient.id,
      patientName: patient.name,
      title,
      observation,
      priority: priority as Priority,
      type: gestionType as GestionType,
      area: isAmbulance ? "Traslados" : area,
      status: isAmbulance ? "PENDIENTE" : "INICIADO",
      createdAt: new Date().toISOString(),
      observations: [],
      ambulanceTransfer: ambulanceData,
    }

    addGestion(newGestion)
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="title">Titulo *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Solicitud de interconsulta"
          />
          {errors.title && <span className="text-xs text-destructive">{errors.title}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="priority">Prioridad *</Label>
          <Select value={priority} onValueChange={(val) => setPriority(val as Priority)}>
            <SelectTrigger id="priority" className="w-full">
              <SelectValue placeholder="Seleccionar prioridad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BAJA">Baja</SelectItem>
              <SelectItem value="MEDIA">Media</SelectItem>
              <SelectItem value="ALTA">Alta</SelectItem>
              <SelectItem value="CRITICA">Critica</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && <span className="text-xs text-destructive">{errors.priority}</span>}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">Tipo de Gestion *</Label>
          <Select
            value={gestionType}
            onValueChange={(val) => {
              setGestionType(val as GestionType)
              if (val === "NORMAL") {
                setAmbulanceData(null)
              }
            }}
          >
            <SelectTrigger id="type" className="w-full">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NORMAL">Normal</SelectItem>
              <SelectItem value="TRASLADO_AMBULANCIA">Traslado Ambulancia</SelectItem>
            </SelectContent>
          </Select>
          {errors.gestionType && (
            <span className="text-xs text-destructive">{errors.gestionType}</span>
          )}
        </div>

        {gestionType !== "TRASLADO_AMBULANCIA" && (
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="area">Area *</Label>
            <Input
              id="area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="Ej: Cardiologia, Diagnostico"
            />
            {errors.area && <span className="text-xs text-destructive">{errors.area}</span>}
          </div>
        )}

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="observation">Observacion (opcional)</Label>
          <Textarea
            id="observation"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            placeholder="Observaciones adicionales..."
            rows={3}
          />
        </div>
      </div>

      {gestionType === "TRASLADO_AMBULANCIA" && (
        <div className="border-t pt-5">
          <h3 className="text-sm font-semibold mb-4 text-foreground">
            Solicitud de Traslado en Ambulancia
          </h3>
          <AmbulanceTransferForm
            onDataChange={setAmbulanceData}
          />
          {errors.ambulance && (
            <span className="text-xs text-destructive mt-2 block">{errors.ambulance}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Crear Gestion</Button>
      </div>
    </form>
  )
}
