import type { PurchaseRequest, Product, Priority, RequestStatus } from './types'

// Seeded random function for deterministic data generation
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000
  return x - Math.floor(x)
}

const centrosAtencion = [
  'Clinica medicos',
  'Alta complejidad'
]

const dependencias = [
  'MANTENIMIENTO ALTA COMPLEJIDAD',
  'UNIDAD FUNCIONAL DE UCI ADULTO',
  'SUB-GERENCIA ADMINISTRATIVA',
  'TIC SISTEMAS ALTA COMPLEJIDAD',
  'BIOMEDICINA ALTA',
  'FARMACIA CENTRAL',
  'URGENCIAS GENERAL',
  'LABORATORIO CLINICO',
  'IMAGENOLOGIA Y RADIOLOGIA',
  'HOSPITALIZACION GENERAL'
]

const usuarios = [
  'MARVING STIVEN DE LA VALLE NIETO',
  'Jorge Luis Vasco Gutierrez',
  'OLGA PATRICIA MUÑOZ LOPEZ',
  'JORGE FERNANDO ARAUJO DIAZ',
  'EDWARD ALEXANDER MAHECHA RAMIREZ',
  'CAROLINA ANDREA MENDEZ SILVA',
  'ROBERTO CARLOS JIMENEZ PARRA',
  'MARIA FERNANDA GOMEZ TORRES',
  'ANDRES FELIPE CASTRO RUIZ',
  'LUCIA PATRICIA HERRERA VEGA'
]

const estados: Record<RequestStatus, string[]> = {
  'NO_ASIGNADAS': ['SIN ASIGNAR', 'PENDIENTE ASIGNACIÓN'],
  'REGISTRADOS': ['REGISTRADO', 'EN REVISIÓN'],
  'APROBADAS_COTIZAR': ['APROBADO PARA COTIZAR', 'EN PROCESO DE COTIZACIÓN'],
  'CON_COTIZACIONES': ['CON COTIZACIÓN(ES)', 'COTIZADO'],
  'COMPRAS_APROBAR': ['COMPRA POR APROBAR', 'EN APROBACIÓN'],
  'ORDENES_PENDIENTES': ['ORDEN DE COMPRA PENDIENTE', 'OC GENERADA'],
  'PENDIENTES_PROGRAMAR': ['PENDIENTE POR PROGRAMAR OC', 'EN PROGRAMACIÓN'],
  'PENDIENTES_CONTABILIZAR': ['PENDIENTE POR CONTABILIZAR OC', 'EN CONTABILIZACIÓN'],
  'PENDIENTES_PAGAR': ['PENDIENTE POR PAGAR OC', 'EN PROCESO DE PAGO'],
  'FINALIZADO': ['PROCESO FINALIZADO', 'COMPLETADO']
}

const justificaciones = [
  'Urgente para atención de pacientes críticos en UCI',
  'Reposición de inventario agotado',
  'Requerimiento para procedimiento programado',
  'Mantenimiento preventivo de equipos',
  'Solicitud de área administrativa',
  'Necesidad operativa del servicio',
  'Pedido regular mensual',
  'Emergencia sanitaria',
  'Actualización tecnológica requerida',
  'Cumplimiento normativo obligatorio'
]

export function generateMockRequests(status: RequestStatus, count: number): PurchaseRequest[] {
  const requests: PurchaseRequest[] = []
  const statusOptions = estados[status]
  const statusSeed = Object.keys(estados).indexOf(status) * 1000
  
  for (let i = 0; i < count; i++) {
    const seed = statusSeed + i
    const prioridades: Priority[] = ['CRITICA', 'ALTA', 'MEDIA', 'BAJA']
    const tipos: ('PRODUCTOS' | 'SERVICIOS')[] = ['PRODUCTOS', 'SERVICIOS']
    
    const fechaCreacion = new Date('2026-03-01')
    fechaCreacion.setDate(fechaCreacion.getDate() - Math.floor(seededRandom(seed) * 30))
    
    const ultimoCambio = new Date(fechaCreacion)
    ultimoCambio.setHours(ultimoCambio.getHours() + Math.floor(seededRandom(seed + 1) * 72))
    
    requests.push({
      id: `${status}-${i}`,
      codigo: `${['AC', 'CM', 'SR', 'PR'][Math.floor(seededRandom(seed + 2) * 4)]}${2580 + i}`,
      dependencia: dependencias[Math.floor(seededRandom(seed + 3) * dependencias.length)],
      tipoSolicitud: tipos[Math.floor(seededRandom(seed + 4) * tipos.length)],
      estado: statusOptions[Math.floor(seededRandom(seed + 5) * statusOptions.length)],
      usuario: usuarios[Math.floor(seededRandom(seed + 6) * usuarios.length)],
      centroAtencion: centrosAtencion[Math.floor(seededRandom(seed + 7) * centrosAtencion.length)],
      fechaCreacion,
      ultimoCambioEstado: ultimoCambio,
      totalFacturado: seededRandom(seed + 8) > 0.6 ? Math.floor(seededRandom(seed + 9) * 10000000) : 0,
      prioridad: prioridades[Math.floor(seededRandom(seed + 10) * prioridades.length)],
      justificacion: justificaciones[Math.floor(seededRandom(seed + 11) * justificaciones.length)]
    })
  }
  
  return requests
}

export function generateMockProducts(requestId: string): Product[] {
  const productos = [
    { nombre: 'Guantes de látex', unidad: 'CAJA' },
    { nombre: 'Jeringa 5ml', unidad: 'UNIDAD' },
    { nombre: 'Alcohol antiséptico', unidad: 'LITRO' },
    { nombre: 'Gasa estéril', unidad: 'PAQUETE' },
    { nombre: 'Mascarilla N95', unidad: 'UNIDAD' },
    { nombre: 'Catéter intravenoso', unidad: 'UNIDAD' },
    { nombre: 'Suero fisiológico', unidad: 'BOLSA' },
    { nombre: 'Vendaje elástico', unidad: 'ROLLO' },
    { nombre: 'Esparadrapo', unidad: 'ROLLO' },
    { nombre: 'Termómetro digital', unidad: 'UNIDAD' }
  ]
  
  // Create seed from requestId
  const idSeed = requestId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const count = Math.floor(seededRandom(idSeed) * 5) + 1
  
  // Deterministic selection based on seed
  const selectedIndices: number[] = []
  for (let i = 0; i < count; i++) {
    const idx = Math.floor(seededRandom(idSeed + i + 100) * productos.length)
    if (!selectedIndices.includes(idx)) {
      selectedIndices.push(idx)
    } else {
      selectedIndices.push((idx + 1) % productos.length)
    }
  }
  
  return selectedIndices.map((idx, i) => {
    const p = productos[idx]
    return {
      id: `${requestId}-p${i}`,
      nombre: p.nombre,
      descripcion: `Descripción detallada de ${p.nombre}`,
      cantidad: Math.floor(seededRandom(idSeed + i + 200) * 100) + 1,
      unidad: p.unidad,
      precioEstimado: Math.floor(seededRandom(idSeed + i + 300) * 500000) + 10000
    }
  })
}

export const stepperData: Record<RequestStatus, number> = {
  'NO_ASIGNADAS': 2,
  'REGISTRADOS': 11,
  'APROBADAS_COTIZAR': 9,
  'CON_COTIZACIONES': 1,
  'COMPRAS_APROBAR': 6,
  'ORDENES_PENDIENTES': 3,
  'PENDIENTES_PROGRAMAR': 311,
  'PENDIENTES_CONTABILIZAR': 22,
  'PENDIENTES_PAGAR': 38,
  'FINALIZADO': 1
}

// Catálogo de productos existentes
export const catalogoProductos = [
  { id: 'P001', codigo: 'MED-001', nombre: 'Guantes de látex talla M', categoria: 'Insumos médicos' },
  { id: 'P002', codigo: 'MED-002', nombre: 'Guantes de látex talla L', categoria: 'Insumos médicos' },
  { id: 'P003', codigo: 'MED-003', nombre: 'Guantes de nitrilo talla M', categoria: 'Insumos médicos' },
  { id: 'P004', codigo: 'MED-004', nombre: 'Jeringa desechable 5ml', categoria: 'Insumos médicos' },
  { id: 'P005', codigo: 'MED-005', nombre: 'Jeringa desechable 10ml', categoria: 'Insumos médicos' },
  { id: 'P006', codigo: 'MED-006', nombre: 'Jeringa desechable 20ml', categoria: 'Insumos médicos' },
  { id: 'P007', codigo: 'MED-007', nombre: 'Alcohol antiséptico 70%', categoria: 'Antisépticos' },
  { id: 'P008', codigo: 'MED-008', nombre: 'Alcohol isopropílico', categoria: 'Antisépticos' },
  { id: 'P009', codigo: 'MED-009', nombre: 'Gasa estéril 10x10cm', categoria: 'Insumos médicos' },
  { id: 'P010', codigo: 'MED-010', nombre: 'Gasa estéril 5x5cm', categoria: 'Insumos médicos' },
  { id: 'P011', codigo: 'MED-011', nombre: 'Mascarilla quirúrgica', categoria: 'Protección' },
  { id: 'P012', codigo: 'MED-012', nombre: 'Mascarilla N95', categoria: 'Protección' },
  { id: 'P013', codigo: 'MED-013', nombre: 'Mascarilla KN95', categoria: 'Protección' },
  { id: 'P014', codigo: 'MED-014', nombre: 'Catéter intravenoso 18G', categoria: 'Insumos médicos' },
  { id: 'P015', codigo: 'MED-015', nombre: 'Catéter intravenoso 20G', categoria: 'Insumos médicos' },
  { id: 'P016', codigo: 'MED-016', nombre: 'Suero fisiológico 500ml', categoria: 'Soluciones' },
  { id: 'P017', codigo: 'MED-017', nombre: 'Suero fisiológico 1000ml', categoria: 'Soluciones' },
  { id: 'P018', codigo: 'MED-018', nombre: 'Vendaje elástico 4 pulgadas', categoria: 'Vendajes' },
  { id: 'P019', codigo: 'MED-019', nombre: 'Vendaje elástico 6 pulgadas', categoria: 'Vendajes' },
  { id: 'P020', codigo: 'MED-020', nombre: 'Esparadrapo microporoso', categoria: 'Vendajes' },
  { id: 'P021', codigo: 'EQP-001', nombre: 'Termómetro digital', categoria: 'Equipos' },
  { id: 'P022', codigo: 'EQP-002', nombre: 'Tensiómetro digital', categoria: 'Equipos' },
  { id: 'P023', codigo: 'EQP-003', nombre: 'Oxímetro de pulso', categoria: 'Equipos' },
  { id: 'P024', codigo: 'EQP-004', nombre: 'Estetoscopio', categoria: 'Equipos' },
  { id: 'P025', codigo: 'OFI-001', nombre: 'Papel bond carta', categoria: 'Oficina' },
  { id: 'P026', codigo: 'OFI-002', nombre: 'Tóner impresora HP', categoria: 'Oficina' },
  { id: 'P027', codigo: 'OFI-003', nombre: 'Carpeta archivo AZ', categoria: 'Oficina' },
  { id: 'P028', codigo: 'LIM-001', nombre: 'Desinfectante multiusos', categoria: 'Limpieza' },
  { id: 'P029', codigo: 'LIM-002', nombre: 'Jabón antibacterial', categoria: 'Limpieza' },
  { id: 'P030', codigo: 'LIM-003', nombre: 'Gel antibacterial', categoria: 'Limpieza' },
]

// Catálogo de proveedores
export const catalogoProveedores = [
  { id: 'PRV001', nit: '800.123.456-7', nombre: 'Distribuidora Médica Nacional S.A.S', contacto: 'Juan Pérez', telefono: '601-1234567' },
  { id: 'PRV002', nit: '900.234.567-8', nombre: 'Insumos Hospitalarios del Caribe', contacto: 'María García', telefono: '605-2345678' },
  { id: 'PRV003', nit: '800.345.678-9', nombre: 'MediEquipos Colombia Ltda', contacto: 'Carlos Rodríguez', telefono: '602-3456789' },
  { id: 'PRV004', nit: '900.456.789-0', nombre: 'Farmacéuticos Unidos S.A', contacto: 'Ana Martínez', telefono: '601-4567890' },
  { id: 'PRV005', nit: '800.567.890-1', nombre: 'Suministros Clínicos del Valle', contacto: 'Pedro Sánchez', telefono: '602-5678901' },
  { id: 'PRV006', nit: '900.678.901-2', nombre: 'BioMed Solutions S.A.S', contacto: 'Laura González', telefono: '601-6789012' },
  { id: 'PRV007', nit: '800.789.012-3', nombre: 'Equipos Quirúrgicos Andinos', contacto: 'Roberto Díaz', telefono: '604-7890123' },
  { id: 'PRV008', nit: '900.890.123-4', nombre: 'Laboratorios MediScience', contacto: 'Carolina López', telefono: '601-8901234' },
  { id: 'PRV009', nit: '800.901.234-5', nombre: 'Distribuciones Salud Total', contacto: 'Andrés Castro', telefono: '605-9012345' },
  { id: 'PRV010', nit: '900.012.345-6', nombre: 'TecnoMed Importadores', contacto: 'Paola Ramírez', telefono: '601-0123456' },
  { id: 'PRV011', nit: '800.111.222-3', nombre: 'Corporación Médica del Norte', contacto: 'Felipe Torres', telefono: '605-1112223' },
  { id: 'PRV012', nit: '900.222.333-4', nombre: 'InsuQuim Farmacéutica', contacto: 'Diana Herrera', telefono: '602-2223334' },
  { id: 'PRV013', nit: '800.333.444-5', nombre: 'MediGroup Internacional', contacto: 'Ricardo Vargas', telefono: '601-3334445' },
  { id: 'PRV014', nit: '900.444.555-6', nombre: 'Soluciones Médicas Integrales', contacto: 'Sandra Morales', telefono: '604-4445556' },
  { id: 'PRV015', nit: '800.555.666-7', nombre: 'Proveeduría Hospitalaria S.A', contacto: 'Miguel Ángel Ruiz', telefono: '601-5556667' },
]

// Precios históricos de productos (para sugerencias)
export const preciosHistoricos: Record<string, number> = {
  'Guantes de látex': 45000,
  'Jeringa 5ml': 1200,
  'Alcohol antiséptico': 18500,
  'Gasa estéril': 12000,
  'Mascarilla N95': 8500,
  'Catéter intravenoso': 15000,
  'Suero fisiológico': 9800,
  'Vendaje elástico': 7500,
  'Esparadrapo': 6200,
  'Termómetro digital': 35000,
}

// Función para generar cotizaciones mock para una solicitud
export function generateMockCotizaciones(solicitudId: string, productos: Product[]): import('./types').CotizacionGuardada[] {
  // Create seed from solicitudId
  const baseSeed = solicitudId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  const numCotizaciones = Math.floor(seededRandom(baseSeed) * 3) + 2 // 2-4 cotizaciones
  const cotizaciones: import('./types').CotizacionGuardada[] = []
  
  // Deterministic provider selection
  const proveedorIndices: number[] = []
  for (let i = 0; i < numCotizaciones; i++) {
    const idx = Math.floor(seededRandom(baseSeed + i + 500) * catalogoProveedores.length)
    if (!proveedorIndices.includes(idx)) {
      proveedorIndices.push(idx)
    } else {
      proveedorIndices.push((idx + 1) % catalogoProveedores.length)
    }
  }
  
  proveedorIndices.forEach((provIdx, index) => {
    const proveedor = catalogoProveedores[provIdx]
    const cotSeed = baseSeed + index * 100
    
    const fechaCotizacion = new Date('2026-03-01')
    fechaCotizacion.setDate(fechaCotizacion.getDate() - Math.floor(seededRandom(cotSeed) * 7))
    
    const productosCotizados = productos.map((producto, pIdx) => {
      const pSeed = cotSeed + pIdx * 10
      const variacionPrecio = 0.8 + seededRandom(pSeed) * 0.4 // -20% a +20%
      const precioBase = producto.precioEstimado * variacionPrecio
      const descuento = seededRandom(pSeed + 1) > 0.7 ? Math.floor(seededRandom(pSeed + 2) * 15) : 0
      const subtotal = precioBase * producto.cantidad * (1 - descuento / 100)
      
      return {
        productoId: producto.id,
        nombre: producto.nombre,
        cantidad: producto.cantidad,
        precioUnitario: Math.round(precioBase),
        descuento,
        subtotal: Math.round(subtotal),
        incluyeIva: seededRandom(pSeed + 3) > 0.5
      }
    })
    
    const totalSinIva = productosCotizados.reduce((sum, p) => sum + p.subtotal, 0)
    const totalConIva = productosCotizados.reduce((sum, p) => {
      return sum + (p.incluyeIva ? p.subtotal : p.subtotal * 1.19)
    }, 0)
    
    const tiposComprobante: ('pdf' | 'image' | 'word' | 'excel')[] = ['pdf', 'image', 'pdf', 'excel']
    
    cotizaciones.push({
      id: `COT-${solicitudId}-${index + 1}`,
      solicitudId,
      proveedorId: proveedor.id,
      proveedorNombre: proveedor.nombre,
      proveedorNit: proveedor.nit,
      fechaCotizacion,
      comprobanteUrl: `/comprobantes/cotizacion-${solicitudId}-${index + 1}.pdf`,
      comprobanteTipo: tiposComprobante[Math.floor(seededRandom(cotSeed + 50) * 4)],
      esUltimaCotizacion: index === numCotizaciones - 1,
      productos: productosCotizados,
      totalSinIva: Math.round(totalSinIva),
      totalConIva: Math.round(totalConIva)
    })
  })
  
  return cotizaciones
}

// Generar recomendación de compra (selección optimizada por producto)
export function generateMockRecomendacion(
  solicitudId: string, 
  cotizaciones: import('./types').CotizacionGuardada[]
): import('./types').RecomendacionCompra {
  const baseSeed = solicitudId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  
  // Obtener todos los productos únicos
  const productosUnicos = cotizaciones[0]?.productos || []
  
  const selecciones: import('./types').SeleccionProducto[] = productosUnicos.map((producto, pIdx) => {
    // Encontrar el mejor precio para este producto
    let mejorCotizacion = cotizaciones[0]
    let mejorPrecio = Infinity
    
    cotizaciones.forEach(cot => {
      const prod = cot.productos.find(p => p.productoId === producto.productoId)
      if (prod && prod.subtotal < mejorPrecio) {
        mejorPrecio = prod.subtotal
        mejorCotizacion = cot
      }
    })
    
    const productoSeleccionado = mejorCotizacion.productos.find(p => p.productoId === producto.productoId)!
    
    return {
      productoId: producto.productoId,
      productoNombre: producto.nombre,
      cantidad: producto.cantidad,
      cotizacionId: mejorCotizacion.id,
      proveedorId: mejorCotizacion.proveedorId,
      proveedorNombre: mejorCotizacion.proveedorNombre,
      precioUnitario: productoSeleccionado.precioUnitario,
      descuento: productoSeleccionado.descuento,
      subtotal: productoSeleccionado.subtotal,
      incluyeIva: productoSeleccionado.incluyeIva,
      esMejorPrecio: true
    }
  })
  
  const totalGeneral = selecciones.reduce((sum, s) => sum + s.subtotal, 0)
  
  const fechaRecomendacion = new Date('2026-03-01')
  fechaRecomendacion.setDate(fechaRecomendacion.getDate() - Math.floor(seededRandom(baseSeed + 999) * 3))
  
  return {
    solicitudId,
    fechaRecomendacion,
    usuarioRecomendador: usuarios[Math.floor(seededRandom(baseSeed + 888) * usuarios.length)],
    selecciones,
    totalGeneral,
    observacionesRecomendador: 'Se recomienda aprobar esta compra. Se seleccionaron los proveedores con mejor precio por cada producto, optimizando el costo total de la solicitud.'
  }
}

export { centrosAtencion, dependencias, catalogoProductos, catalogoProveedores, preciosHistoricos, generateMockCotizaciones, generateMockRecomendacion }
