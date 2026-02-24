export type Priority = "BAJA" | "MEDIA" | "ALTA" | "CRITICA"
export type GestionType = "NORMAL" | "TRASLADO_AMBULANCIA"
export type NormalStatus = "INICIADO" | "EN_PROCESO" | "FINALIZADO"
export type AmbulanceTripStatus = "PENDIENTE" | "ASIGNADO" | "INICIADO" | "FINALIZADO"
export type TransferType = "SIMPLE" | "REDONDO"

export interface Patient {
  id: string
  bedCode: string
  name: string
  document: string
  age: number
  admissionDate: string
  contractName: string
  company: string
}

export interface Observation {
  id: string
  text: string
  createdAt: string
  author: string
}

export interface AmbulanceTrip {
  id: string
  tripNumber: number
  status: AmbulanceTripStatus
  driver: string | null
  origin: string
  destination: string
}

export interface AmbulanceTransfer {
  transferType: TransferType
  reason: string
  dateTime: string
  origin: {
    place: string
    address: string
    department: string
    municipality: string
  }
  destination: {
    place: string
    address: string
    department: string
    municipality: string
  }
  destinationService: string
  vitalSupport: {
    infusionPump: boolean
    mechanicalVentilator: boolean
  }
  observation: string
  requiresEPP: boolean
  trips: AmbulanceTrip[]
}

export interface Gestion {
  id: string
  code: string
  patientId: string
  patientName: string
  title: string
  observation: string
  priority: Priority
  type: GestionType
  area: string
  status: NormalStatus | string
  createdAt: string
  observations: Observation[]
  ambulanceTransfer: AmbulanceTransfer | null
}
