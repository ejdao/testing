"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AmbulanceTransfer, TransferType } from "@/lib/types"

interface AmbulanceTransferFormProps {
  onDataChange: (data: AmbulanceTransfer | null) => void
}

export function AmbulanceTransferForm({ onDataChange }: AmbulanceTransferFormProps) {
  const [transferType, setTransferType] = useState<TransferType | "">("")
  const [reason, setReason] = useState("")
  const [dateTime, setDateTime] = useState("")
  const [originPlace, setOriginPlace] = useState("")
  const [originAddress, setOriginAddress] = useState("")
  const [originDepartment, setOriginDepartment] = useState("")
  const [originMunicipality, setOriginMunicipality] = useState("")
  const [destPlace, setDestPlace] = useState("")
  const [destAddress, setDestAddress] = useState("")
  const [destDepartment, setDestDepartment] = useState("")
  const [destMunicipality, setDestMunicipality] = useState("")
  const [destService, setDestService] = useState("")
  const [infusionPump, setInfusionPump] = useState(false)
  const [mechanicalVentilator, setMechanicalVentilator] = useState(false)
  const [observation, setObservation] = useState("")
  const [requiresEPP, setRequiresEPP] = useState(false)

  useEffect(() => {
    const isValid =
      transferType !== "" &&
      reason.trim() !== "" &&
      dateTime !== "" &&
      originPlace.trim() !== "" &&
      originAddress.trim() !== "" &&
      originDepartment.trim() !== "" &&
      originMunicipality.trim() !== "" &&
      destPlace.trim() !== "" &&
      destAddress.trim() !== "" &&
      destDepartment.trim() !== "" &&
      destMunicipality.trim() !== "" &&
      destService !== ""

    if (isValid) {
      const data: AmbulanceTransfer = {
        transferType: transferType as TransferType,
        reason,
        dateTime,
        origin: {
          place: originPlace,
          address: originAddress,
          department: originDepartment,
          municipality: originMunicipality,
        },
        destination: {
          place: destPlace,
          address: destAddress,
          department: destDepartment,
          municipality: destMunicipality,
        },
        destinationService: destService,
        vitalSupport: {
          infusionPump,
          mechanicalVentilator,
        },
        observation,
        requiresEPP,
        trips: [
          {
            id: `trip-${Date.now()}`,
            tripNumber: 1,
            status: "PENDIENTE",
            driver: null,
            origin: originPlace,
            destination: destPlace,
          },
        ],
      }
      onDataChange(data)
    } else {
      onDataChange(null)
    }
  }, [
    transferType, reason, dateTime,
    originPlace, originAddress, originDepartment, originMunicipality,
    destPlace, destAddress, destDepartment, destMunicipality,
    destService, infusionPump, mechanicalVentilator, observation, requiresEPP,
    onDataChange,
  ])

  return (
    <div className="flex flex-col gap-5">
      {/* Transfer Type & Reason */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="transferType">Tipo de Traslado *</Label>
          <Select
            value={transferType}
            onValueChange={(val) => setTransferType(val as TransferType)}
          >
            <SelectTrigger id="transferType" className="w-full">
              <SelectValue placeholder="Seleccionar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SIMPLE">Simple</SelectItem>
              <SelectItem value="REDONDO">Redondo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="dateTime">Fecha y Hora del Traslado *</Label>
          <Input
            id="dateTime"
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor="reason">Motivo del Traslado *</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo del traslado"
          />
        </div>
      </div>

      {/* Origin */}
      <fieldset className="border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2 text-foreground">Lugar de Origen</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="originPlace">Lugar *</Label>
            <Input
              id="originPlace"
              value={originPlace}
              onChange={(e) => setOriginPlace(e.target.value)}
              placeholder="Ej: Hospital Central"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="originAddress">Direccion *</Label>
            <Input
              id="originAddress"
              value={originAddress}
              onChange={(e) => setOriginAddress(e.target.value)}
              placeholder="Ej: Cra 10 #20-30"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="originDept">Departamento *</Label>
            <Input
              id="originDept"
              value={originDepartment}
              onChange={(e) => setOriginDepartment(e.target.value)}
              placeholder="Ej: Cundinamarca"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="originMun">Municipio *</Label>
            <Input
              id="originMun"
              value={originMunicipality}
              onChange={(e) => setOriginMunicipality(e.target.value)}
              placeholder="Ej: Bogota"
            />
          </div>
        </div>
      </fieldset>

      {/* Destination */}
      <fieldset className="border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2 text-foreground">Lugar de Destino</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="destPlace">Lugar *</Label>
            <Input
              id="destPlace"
              value={destPlace}
              onChange={(e) => setDestPlace(e.target.value)}
              placeholder="Ej: Fundacion Cardioinfantil"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="destAddress">Direccion *</Label>
            <Input
              id="destAddress"
              value={destAddress}
              onChange={(e) => setDestAddress(e.target.value)}
              placeholder="Ej: Calle 163A #13B-60"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="destDept">Departamento *</Label>
            <Input
              id="destDept"
              value={destDepartment}
              onChange={(e) => setDestDepartment(e.target.value)}
              placeholder="Ej: Cundinamarca"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="destMun">Municipio *</Label>
            <Input
              id="destMun"
              value={destMunicipality}
              onChange={(e) => setDestMunicipality(e.target.value)}
              placeholder="Ej: Bogota"
            />
          </div>
        </div>
      </fieldset>

      {/* Destination Service */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="destService">Servicio del Destino *</Label>
        <Select value={destService} onValueChange={setDestService}>
          <SelectTrigger id="destService" className="w-full">
            <SelectValue placeholder="Seleccionar servicio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="UCI">UCI</SelectItem>
            <SelectItem value="PSIQUIATRIA">Psiquiatria</SelectItem>
            <SelectItem value="URGENCIAS">Urgencias</SelectItem>
            <SelectItem value="CIRUGIA">Cirugia</SelectItem>
            <SelectItem value="MEDICINA_INTERNA">Medicina Interna</SelectItem>
            <SelectItem value="PEDIATRIA">Pediatria</SelectItem>
            <SelectItem value="GINECOLOGIA">Ginecologia</SelectItem>
            <SelectItem value="ONCOLOGIA">Oncologia</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Vital Support */}
      <fieldset className="border rounded-lg p-4">
        <legend className="text-sm font-semibold px-2 text-foreground">
          Tipo de Soporte Vital
        </legend>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="infusionPump"
              checked={infusionPump}
              onCheckedChange={(val) => setInfusionPump(val === true)}
            />
            <Label htmlFor="infusionPump" className="font-normal cursor-pointer">
              Bomba de Infusion
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="mechanicalVentilator"
              checked={mechanicalVentilator}
              onCheckedChange={(val) => setMechanicalVentilator(val === true)}
            />
            <Label htmlFor="mechanicalVentilator" className="font-normal cursor-pointer">
              Ventilador Mecanico
            </Label>
          </div>
        </div>
      </fieldset>

      {/* Observation */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="ambObs">Observacion (opcional)</Label>
        <Textarea
          id="ambObs"
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          placeholder="Observaciones adicionales del traslado..."
          rows={3}
        />
      </div>

      {/* EPP */}
      <div className="flex items-center gap-2 p-3 rounded-lg border bg-muted/30">
        <Checkbox
          id="requiresEPP"
          checked={requiresEPP}
          onCheckedChange={(val) => setRequiresEPP(val === true)}
        />
        <Label htmlFor="requiresEPP" className="font-normal cursor-pointer">
          Requiere Elemento de Proteccion Personal (EPP)
        </Label>
      </div>
    </div>
  )
}
