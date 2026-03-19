// Tipos para el Sistema de Gestión de Traslados Asistenciales

export type TipoDocumento = 'CC' | 'TI' | 'CE' | 'PA' | 'RC' | 'MS' | 'AS';
export type SexoBiologico = 'M' | 'F' | 'I';
export type GrupoSanguineo = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'Desconocido';
export type TriageNivel = 1 | 2 | 3 | 4 | 5;
export type MotivoTrasladoPrimario = 'enfermedad_general' | 'accidente_laboral' | 'accidente_transito' | 'otro';
export type MotivoTrasladoSecundario = 'remision_eps' | 'referencia_ips' | 'contrarreferencia' | 'otro';
export type TipoRecorrido = 'simple' | 'redondo';
export type EstadoPaciente = 'vivo' | 'muerto';

export type EstadoTraslado = 
  | 'pendiente'           // Recién creado, esperando asignación
  | 'asignado'            // Central asignó ambulancia
  | 'en_ruta'             // Auxiliar inició el traslado
  | 'en_escena'           // Ambulancia llegó al origen
  | 'en_traslado'         // Paciente en camino al destino
  | 'finalizado'          // Traslado completado
  | 'cancelado';          // Traslado cancelado

export type TipoIncidente = 'averia' | 'accidente' | 'retraso' | 'complicacion_paciente' | 'otro';
export type PrioridadIncidente = 'baja' | 'media' | 'alta' | 'critica';

// Datos del paciente compartidos
export interface DatosPaciente {
  nombres: string;
  apellidos: string;
  tipoDocumento: TipoDocumento;
  numeroDocumento: string;
  edad: number;
  sexoBiologico: SexoBiologico;
  grupoSanguineo?: GrupoSanguineo;
  eps: string;
  arl?: string;
  soat?: string;
}

// Signos vitales
export interface SignosVitales {
  tensionArterial: string;        // TA mmHg
  frecuenciaCardiaca: number;     // FC p/min
  frecuenciaRespiratoria: number; // FR r/min
  saturacionOxigeno: number;      // SatO2 %
  frecuenciaCardiacaFetal?: number; // FCF p/min (si aplica)
  glasgow: number;
  peso?: number;                  // Kg
  talla?: number;                 // cm
  temperatura?: number;           // °C
}

// Tripulación
export interface Tripulacion {
  conductor: {
    nombre: string;
    cedula: string;
  };
  auxiliarEnfermeria: {
    nombre: string;
    cedula: string;
  };
  medico?: {
    nombre: string;
    cedula: string;
    registroMedico: string;
  };
  acompanantePaciente?: {
    nombre: string;
    cedula: string;
    relacion: string;
  };
}

// Profesional receptor
export interface ProfesionalReceptor {
  nombre: string;
  cedula: string;
  fechaHoraRecepcion: string;
}

// Traslado Primario (REF-FT-04A)
export interface TrasladoPrimario {
  id: string;
  tipo: 'primario';
  estado: EstadoTraslado;
  
  // Tiempos operacionales
  tiempos: {
    fechaSolicitud: string;
    horaDespacho?: string;
    horaLlegadaEscena?: string;
    horaSalidaEscena?: string;
    horaLlegadaInstitucion?: string;
    horaRecepcionInstitucion?: string;
  };

  // Datos del paciente
  paciente: DatosPaciente;

  // Datos clínicos
  datosClinicosLlegada: {
    triageEscena: TriageNivel;
    signosVitales: SignosVitales;
    estadoIngreso: EstadoPaciente;
    hallazgosClinicos: string;
    diagnosticoPrincipal: string;   // CIE-10
    diagnosticoSecundario?: string; // CIE-10
  };

  // Procedimientos y medicamentos
  procedimientos: {
    codigoCupsTraslado: string;
    procedimientosRealizados: string;
    medicamentos: string;
  };

  // Datos del traslado
  datosTraslado: {
    motivo: MotivoTrasladoPrimario;
    motivoOtro?: string;
    lugarOrigen: string;           // Código REPS o dirección
    institucionDestino: {
      codigoReps: string;
      nombre: string;
      municipio: string;
    };
  };

  // Tripulación
  tripulacion: Tripulacion;
  vehiculoPlaca: string;
  profesionalReceptor?: ProfesionalReceptor;
  observaciones: string;

  // Metadata
  creadoPor: string;
  fechaCreacion: string;
  ambulanciaAsignada?: string;
}

// Traslado Secundario (REF-FT-04B)
export interface TrasladoSecundario {
  id: string;
  tipo: 'secundario';
  estado: EstadoTraslado;

  // Tiempos y distancia
  tiemposRecorrido: {
    fechaHoraInicio?: string;
    fechaHoraFinalizacion?: string;
    kilometrosIniciales?: number;
    kilometrosFinales?: number;
    totalKmRecorridos?: number;
    tipoRecorrido: TipoRecorrido;
    horasEspera?: number;           // Si es redondo
    descripcionEspera?: string;     // Si es redondo
  };

  // Datos del paciente
  paciente: DatosPaciente;
  grupoServicioDestino: string;     // Anexo Técnico Res. 3100/2019
  estadoFinalizacion?: EstadoPaciente;

  // Datos clínicos
  datosClinicosLlegada: {
    signosVitales: SignosVitales;
    diagnostico: string;            // CIE-10
  };

  // Procedimientos
  procedimientos: {
    codigoCupsTraslado: string;
    procedimientosRealizados: string;
    medicamentos: string;
  };

  // Origen y destino
  datosTraslado: {
    motivo: MotivoTrasladoSecundario;
    motivoOtro?: string;
    ipsOrigen: {
      codigoReps: string;
      nombre: string;
      municipio: string;
      departamento: string;
    };
    ipsDestino: {
      codigoReps: string;
      nombre: string;
      municipio: string;
      departamento: string;
    };
    ingresoComplicaciones?: {
      huboIngreso: boolean;
      causa?: string;
      nombreIps?: string;
      kmDesviacion?: number;
      tiempoUtilizado?: string;
    };
  };

  // Tripulación
  tripulacion: Tripulacion;
  vehiculoPlaca: string;
  numeroAutorizacionEps?: string;
  profesionalReceptor?: ProfesionalReceptor;
  observaciones: string;

  // Metadata
  solicitadoPor: string;            // Médico que solicita
  creadoPor?: string;               // Auxiliar que completa
  fechaSolicitud: string;
  fechaCreacion?: string;
  ambulanciaAsignada?: string;
}

// Ambulancia
export interface Ambulancia {
  id: string;
  placa: string;
  tipo: 'TAB' | 'TAM';              // Básica o Medicalizada
  estado: 'disponible' | 'en_servicio' | 'fuera_servicio' | 'mantenimiento';
  tripulacionActual?: Tripulacion;
  ubicacionActual?: string;
  trasladoActual?: string;          // ID del traslado en curso
}

// Notificación/Incidente
export interface Incidente {
  id: string;
  trasladoId: string;
  tipo: TipoIncidente;
  prioridad: PrioridadIncidente;
  descripcion: string;
  reportadoPor: string;
  fechaHora: string;
  atendido: boolean;
  respuesta?: string;
  atendidoPor?: string;
  fechaAtencion?: string;
}

// Usuario del sistema (simplificado para demo)
export type RolUsuario = 'auxiliar' | 'medico' | 'central';

export interface Usuario {
  id: string;
  nombre: string;
  rol: RolUsuario;
  cedula: string;
}
