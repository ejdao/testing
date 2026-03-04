// ── Roles ──
export type Rol = "central" | "enfermera" | "conductor" | "medico" | "admin"

// ── Usuario ──
export interface Usuario {
  id: string
  nombre: string
  apellido: string
  rol: Rol
  servicio?: string
  turno?: "diurno" | "nocturno"
  documento?: string
  email?: string
}

// ── Paciente ──
export interface Paciente {
  nombreCompleto: string
  documento: string
  tipoDocumento: "CC" | "TI" | "CE" | "PA" | "RC"
  edad: number
  sexo: "M" | "F"
  eps: string
  tipoAfiliacion: "contributivo" | "subsidiado" | "vinculado" | "particular"
  diagnostico: string
  cama?: string
}

// ── Signos Vitales ──
export interface SignosVitales {
  tensionSistolica: number
  tensionDiastolica: number
  frecuenciaCardiaca: number
  frecuenciaRespiratoria: number
  spo2: number
  temperatura: number
  glasgow: number
}

// ── Traslado ──
export type TipoTraslado = "primario" | "secundario"
export type PrioridadTraslado = "urgente" | "programado"
export type EstadoTraslado =
  | "pendiente"
  | "asignado"
  | "en_camino"
  | "en_origen"
  | "en_traslado"
  | "entregado"
  | "completado"
  | "cancelado"

export interface Traslado {
  id: string
  tipo: TipoTraslado
  prioridad: PrioridadTraslado
  estado: EstadoTraslado
  paciente: Paciente
  signosVitales: SignosVitales
  servicioOrigen: string
  institucionOrigen: string
  servicioDestino: string
  institucionDestino: string
  motivoTraslado: string
  requiereMedico: boolean
  notaEnfermeria: string
  observaciones: string
  fechaSolicitud: string
  fechaAsignacion?: string
  fechaInicio?: string
  fechaFinalizacion?: string
  enfermeroSolicitante: string
  enfermeroSolicitanteId: string
  movilAsignada?: string
  operadorCentral?: string
  conductorAsignado?: string
  equipoRequerido: string[]
}

// ── Ambulancia / Movil ──
export type TipoMovil = "basica" | "medicalizada" | "TAM"
export type EstadoMovil =
  | "disponible"
  | "en_servicio"
  | "retornando"
  | "mantenimiento"
  | "fuera_servicio"

export interface Tripulante {
  id: string
  nombre: string
  rol: "conductor" | "medico" | "enfermero" | "auxiliar"
}

export interface Movil {
  id: string
  numero: string
  placa: string
  tipo: TipoMovil
  estado: EstadoMovil
  tripulacion: Tripulante[]
  trasladoActual?: string
  ubicacion?: string
}

// ── Evento Timeline ──
export interface EventoTimeline {
  id: string
  trasladoId: string
  tipo: EstadoTraslado
  descripcion: string
  fecha: string
  usuario: string
}

// ── Constantes ──
export const SERVICIOS_HOSPITALARIOS = [
  "UCI Adultos",
  "UCI Pediatrica",
  "UCI Neonatal",
  "Urgencias",
  "Hospitalizacion",
  "Cirugia",
  "Pediatria",
  "Ginecologia",
  "Traumatologia",
  "Medicina Interna",
  "Cardiologia",
  "Neurologia",
  "Oncologia",
  "Nefrologia",
  "Consulta Externa",
  "Imagenologia",
  "Laboratorio",
] as const

export const INSTITUCIONES = [
  "Hospital Universitario San Jorge",
  "Clinica Los Rosales",
  "Hospital San Pedro y San Pablo",
  "ESE Salud Pereira",
  "Clinica Comfamiliar",
  "Hospital de Kennedy",
  "Clinica San Rafael",
  "Hospital Infantil",
  "Centro Medico Especializado",
] as const

export const EQUIPO_DISPONIBLE = [
  "Oxigeno",
  "Monitor cardiaco",
  "Bomba de infusion",
  "Ventilador mecanico",
  "Aspirador de secreciones",
  "Colchon de vacio",
  "Tabla espinal",
  "Collar cervical",
  "Incubadora",
  "Aislamiento",
] as const

export const EPS_LISTA = [
  "Nueva EPS",
  "Sura EPS",
  "Salud Total",
  "Coomeva EPS",
  "Sanitas",
  "Famisanar",
  "Compensar",
  "Medimas",
  "Coosalud",
  "Mutual SER",
  "Asmet Salud",
  "Emssanar",
  "Particular",
] as const
