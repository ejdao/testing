export type Priority = 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA'

export type RequestStatus = 
  | 'NO_ASIGNADAS'
  | 'REGISTRADOS' 
  | 'APROBADAS_COTIZAR'
  | 'CON_COTIZACIONES'
  | 'COMPRAS_APROBAR'
  | 'ORDENES_PENDIENTES'
  | 'PENDIENTES_PROGRAMAR'
  | 'PENDIENTES_CONTABILIZAR'
  | 'PENDIENTES_PAGAR'
  | 'FINALIZADO'

export type RequestType = 'PRODUCTOS' | 'SERVICIOS'

export interface PurchaseRequest {
  id: string
  codigo: string
  dependencia: string
  tipoSolicitud: RequestType
  estado: string
  usuario: string
  centroAtencion: string
  fechaCreacion: Date
  ultimoCambioEstado: Date
  totalFacturado: number
  prioridad: Priority
  justificacion: string
}

export interface Product {
  id: string
  nombre: string
  descripcion: string
  cantidad: number
  unidad: string
  precioEstimado: number
}

export interface StepperItem {
  id: RequestStatus
  label: string
  count: number
  icon: React.ReactNode
}

export interface FilterState {
  search: string
  centroAtencion: string
  prioridad: Priority | ''
  tipoSolicitud: RequestType | ''
  fechaDesde: string
  fechaHasta: string
}

export type ItemType = 'PRODUCTO' | 'ACTIVO_FIJO'

export interface RequestItem {
  id: string
  nombreItem: string
  esNuevoProducto: boolean
  fichaTecnica: File | null
  tipoItem: ItemType | ''
  cantidad: number
  marca: string
  descripcion: string
}

export interface ProductoCatalogo {
  id: string
  codigo: string
  nombre: string
  categoria: string
}

export interface Proveedor {
  id: string
  nit: string
  nombre: string
  contacto: string
  telefono: string
}

export interface ProductoCotizacion {
  productoId: string
  nombre: string
  cantidad: number
  precioAnterior?: number
  precio: number
  descuento: number
  total: number
  incluyeIva: boolean
}

export interface Cotizacion {
  proveedorId: string
  proveedorNombre: string
  esNuevoProveedor: boolean
  esUltimaCotizacion: boolean
  comprobante: File | null
  productos: ProductoCotizacion[]
}

// Cotizaciones guardadas (para comparación)
export interface CotizacionGuardada {
  id: string
  solicitudId: string
  proveedorId: string
  proveedorNombre: string
  proveedorNit: string
  fechaCotizacion: Date
  comprobanteUrl: string
  comprobanteTipo: 'pdf' | 'image' | 'word' | 'excel'
  esUltimaCotizacion: boolean
  productos: ProductoCotizacionGuardada[]
  totalSinIva: number
  totalConIva: number
}

export interface ProductoCotizacionGuardada {
  productoId: string
  nombre: string
  cantidad: number
  precioUnitario: number
  descuento: number
  subtotal: number
  incluyeIva: boolean
}

// Selección de productos recomendados (resultado de comparación)
export interface SeleccionProducto {
  productoId: string
  productoNombre: string
  cantidad: number
  cotizacionId: string
  proveedorId: string
  proveedorNombre: string
  precioUnitario: number
  descuento: number
  subtotal: number
  incluyeIva: boolean
  esMejorPrecio: boolean
}

export interface RecomendacionCompra {
  solicitudId: string
  fechaRecomendacion: Date
  usuarioRecomendador: string
  selecciones: SeleccionProducto[]
  totalGeneral: number
  observacionesRecomendador: string
}

// Tipos de pago para órdenes de compra
export type TipoPago = 'ANTICIPO' | 'CREDITO' | 'CREDIANTICIPO'

export interface CuotaPago {
  numeroCuota: number
  porcentaje: number
  monto: number
}

export interface OrdenCompra {
  consecutivo: string
  solicitudId: string
  tipoPago: TipoPago
  numeroCuotas: number
  cuotas: CuotaPago[]
  ultimoPagoAlFinalizar: boolean
  totalOrden: number
  fechaCreacion: Date
}

// Historial de cambios de estado
export interface CambioEstado {
  id: string
  solicitudId: string
  estadoAnterior: string
  estadoNuevo: string
  fecha: Date
  usuarioId: string
  usuarioNombre: string
  usuarioDocumento: string
  observaciones: string
}

// Programación de pagos
export interface CuotaProgramada extends CuotaPago {
  plazoDias: number
  fechaLimite: Date
  estado: 'PENDIENTE' | 'PROGRAMADA' | 'PAGADA' | 'CANCELADA'
  fechaProgramacion?: Date
  observacionesProgramacion?: string
}

export interface ProgramacionPago {
  solicitudId: string
  ordenCompraConsecutivo: string
  cuotaNumero: number
  porcentaje: number
  monto: number
  plazoDias: number
  fechaLimite: Date
  fechaProgramacion: Date
  observaciones: string
}

export interface CancelacionCompra {
  solicitudId: string
  ordenCompraConsecutivo: string
  motivoCancelacion: string
  fechaCancelacion: Date
}

// Contabilización
export interface DatosContabilizacion {
  solicitudId: string
  ordenCompraConsecutivo: string
  cuotaNumero: number
  porcentaje: number
  subtotal: number
  descuentos: number
  iva: number
  total: number
  fechaSugerida: Date
  consecutivoCuentaPagar: string
  codigoComprobanteContable: string
  retefuentePorcentaje: number
  retefuenteValor: number
  reteicaPorcentaje: number
  reteicaValor: number
  reteivaPorcentaje: number
  reteivaaValor: number
  descuentoAdicional: number
  totalRetencion: number
  netoPagar: number
  observaciones: string
}
