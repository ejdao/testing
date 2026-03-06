'use client'

import { useState, useMemo } from 'react'
import { X, FileText, Image, FileSpreadsheet, Download, Trophy, TrendingDown, Check, Eye, ShoppingCart, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PurchaseRequest, CotizacionGuardada } from '@/lib/types'

interface QuotationComparisonModalProps {
  request: PurchaseRequest | null
  cotizaciones: CotizacionGuardada[]
  onClose: () => void
}

interface SeleccionProducto {
  productoNombre: string
  proveedorId: string
  proveedorNombre: string
  cotizacionId: string
  precioUnitario: number
  cantidad: number
  descuento: number
  subtotal: number
  incluyeIva: boolean
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

function getFileIcon(tipo: 'pdf' | 'image' | 'word' | 'excel') {
  switch (tipo) {
    case 'pdf':
      return <FileText className="h-4 w-4 text-red-500" />
    case 'image':
      return <Image className="h-4 w-4 text-blue-500" />
    case 'excel':
      return <FileSpreadsheet className="h-4 w-4 text-green-600" />
    case 'word':
      return <FileText className="h-4 w-4 text-blue-600" />
  }
}

export function QuotationComparisonModal({ request, cotizaciones, onClose }: QuotationComparisonModalProps) {
  const [viewingComprobante, setViewingComprobante] = useState<CotizacionGuardada | null>(null)
  
  // Selección por producto: { nombreProducto: { proveedorId, cotizacionId, ... } }
  const [seleccionesPorProducto, setSeleccionesPorProducto] = useState<Record<string, SeleccionProducto>>({})

  // Análisis de precios por producto
  const analisisPorProducto = useMemo(() => {
    if (cotizaciones.length === 0) return []

    const productos = cotizaciones[0].productos.map(p => p.nombre)
    
    return productos.map(nombreProducto => {
      const preciosPorProveedor = cotizaciones.map(cot => {
        const producto = cot.productos.find(p => p.nombre === nombreProducto)
        return {
          cotizacionId: cot.id,
          proveedorId: cot.proveedorId,
          proveedorNombre: cot.proveedorNombre,
          proveedorNit: cot.proveedorNit,
          precioUnitario: producto?.precioUnitario || 0,
          descuento: producto?.descuento || 0,
          subtotal: producto?.subtotal || 0,
          incluyeIva: producto?.incluyeIva || false,
          cantidad: producto?.cantidad || 0
        }
      })

      const precios = preciosPorProveedor.map(p => p.subtotal).filter(p => p > 0)
      const minPrecio = Math.min(...precios)
      const maxPrecio = Math.max(...precios)
      const mejorOpcion = preciosPorProveedor.find(p => p.subtotal === minPrecio)

      return {
        nombre: nombreProducto,
        preciosPorProveedor,
        minPrecio,
        maxPrecio,
        diferencia: maxPrecio - minPrecio,
        mejorOpcion
      }
    })
  }, [cotizaciones])

  // Auto-seleccionar los mejores precios
  const seleccionarMejoresPrecios = () => {
    const nuevasSelecciones: Record<string, SeleccionProducto> = {}
    
    analisisPorProducto.forEach(producto => {
      if (producto.mejorOpcion) {
        nuevasSelecciones[producto.nombre] = {
          productoNombre: producto.nombre,
          proveedorId: producto.mejorOpcion.proveedorId,
          proveedorNombre: producto.mejorOpcion.proveedorNombre,
          cotizacionId: producto.mejorOpcion.cotizacionId,
          precioUnitario: producto.mejorOpcion.precioUnitario,
          cantidad: producto.mejorOpcion.cantidad,
          descuento: producto.mejorOpcion.descuento,
          subtotal: producto.mejorOpcion.subtotal,
          incluyeIva: producto.mejorOpcion.incluyeIva
        }
      }
    })
    
    setSeleccionesPorProducto(nuevasSelecciones)
  }

  // Seleccionar un proveedor para un producto específico
  const seleccionarProveedorParaProducto = (
    nombreProducto: string, 
    proveedorInfo: typeof analisisPorProducto[0]['preciosPorProveedor'][0]
  ) => {
    setSeleccionesPorProducto(prev => ({
      ...prev,
      [nombreProducto]: {
        productoNombre: nombreProducto,
        proveedorId: proveedorInfo.proveedorId,
        proveedorNombre: proveedorInfo.proveedorNombre,
        cotizacionId: proveedorInfo.cotizacionId,
        precioUnitario: proveedorInfo.precioUnitario,
        cantidad: proveedorInfo.cantidad,
        descuento: proveedorInfo.descuento,
        subtotal: proveedorInfo.subtotal,
        incluyeIva: proveedorInfo.incluyeIva
      }
    }))
  }

  // Quitar selección de un producto
  const quitarSeleccion = (nombreProducto: string) => {
    setSeleccionesPorProducto(prev => {
      const nuevas = { ...prev }
      delete nuevas[nombreProducto]
      return nuevas
    })
  }

  // Resumen de selecciones agrupadas por proveedor
  const resumenPorProveedor = useMemo(() => {
    const agrupado: Record<string, {
      proveedorId: string
      proveedorNombre: string
      productos: SeleccionProducto[]
      total: number
    }> = {}

    Object.values(seleccionesPorProducto).forEach(sel => {
      if (!agrupado[sel.proveedorId]) {
        agrupado[sel.proveedorId] = {
          proveedorId: sel.proveedorId,
          proveedorNombre: sel.proveedorNombre,
          productos: [],
          total: 0
        }
      }
      agrupado[sel.proveedorId].productos.push(sel)
      agrupado[sel.proveedorId].total += sel.subtotal
    })

    return Object.values(agrupado)
  }, [seleccionesPorProducto])

  // Total de la selección actual
  const totalSeleccion = useMemo(() => {
    return Object.values(seleccionesPorProducto).reduce((sum, sel) => sum + sel.subtotal, 0)
  }, [seleccionesPorProducto])

  // Total si se comprara todo al mejor proveedor general
  const totalMejorProveedorGeneral = useMemo(() => {
    if (cotizaciones.length === 0) return 0
    return Math.min(...cotizaciones.map(c => c.totalConIva))
  }, [cotizaciones])

  // Ahorro por seleccionar individualmente
  const ahorroSeleccionIndividual = useMemo(() => {
    const totalOptimizado = analisisPorProducto.reduce((sum, p) => sum + p.minPrecio, 0)
    return totalMejorProveedorGeneral - totalOptimizado
  }, [analisisPorProducto, totalMejorProveedorGeneral])

  if (!request) return null

  const numSeleccionados = Object.keys(seleccionesPorProducto).length
  const totalProductos = analisisPorProducto.length

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-border my-auto"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-primary" />
              Comparación de Cotizaciones
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Solicitud <span className="font-mono font-medium">{request.codigo}</span> · {cotizaciones.length} cotizaciones · {totalProductos} productos
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0 space-y-6">
          {/* Acciones rápidas y ahorro potencial */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Trophy className="h-5 w-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900">Optimiza tu compra</h3>
                  <p className="text-sm text-emerald-700 mt-1">
                    Seleccionando el mejor precio por producto puedes ahorrar hasta{' '}
                    <span className="font-semibold">{formatCurrency(ahorroSeleccionIndividual)}</span> respecto a comprar todo con un solo proveedor.
                  </p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={seleccionarMejoresPrecios}
              className="gap-2 h-auto py-3 px-4 bg-primary hover:bg-primary/90"
            >
              <Sparkles className="h-4 w-4" />
              <div className="text-left">
                <div className="font-medium">Seleccionar mejores precios</div>
                <div className="text-xs opacity-80">Auto-optimizar por producto</div>
              </div>
            </Button>
          </div>

          {/* Resumen de proveedores */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
              Proveedores ({cotizaciones.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {cotizaciones.map((cot) => (
                <div 
                  key={cot.id}
                  className="border border-border rounded-lg p-3 bg-background"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-foreground text-sm truncate" title={cot.proveedorNombre}>
                        {cot.proveedorNombre}
                      </h4>
                      <p className="text-xs text-muted-foreground">NIT: {cot.proveedorNit}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-7 text-xs gap-1 flex-shrink-0"
                      onClick={() => setViewingComprobante(cot)}
                    >
                      {getFileIcon(cot.comprobanteTipo)}
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total cotización:</span>
                    <span className="font-mono font-medium">{formatCurrency(cot.totalConIva)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabla comparativa con selección por producto */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Selecciona proveedor por producto
              </h3>
              {numSeleccionados > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-muted-foreground"
                  onClick={() => setSeleccionesPorProducto({})}
                >
                  Limpiar selección
                </Button>
              )}
            </div>
            
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Producto</th>
                      {cotizaciones.map((cot) => (
                        <th key={cot.id} className="px-4 py-3 text-center font-semibold text-muted-foreground min-w-[160px]">
                          <div className="truncate max-w-[140px] mx-auto" title={cot.proveedorNombre}>
                            {cot.proveedorNombre.split(' ').slice(0, 2).join(' ')}
                          </div>
                        </th>
                      ))}
                      <th className="px-4 py-3 text-center font-semibold text-primary bg-primary/5 min-w-[140px]">
                        Seleccionado
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {analisisPorProducto.map((producto) => {
                      const seleccionado = seleccionesPorProducto[producto.nombre]
                      
                      return (
                        <tr key={producto.nombre} className="hover:bg-muted/30">
                          <td className="px-4 py-3">
                            <div className="font-medium text-foreground">{producto.nombre}</div>
                            <div className="text-xs text-muted-foreground">
                              Ahorro posible: {formatCurrency(producto.diferencia)}
                            </div>
                          </td>
                          {cotizaciones.map((cot) => {
                            const precioInfo = producto.preciosPorProveedor.find(p => p.cotizacionId === cot.id)
                            const esMejor = precioInfo?.subtotal === producto.minPrecio
                            const esPeor = precioInfo?.subtotal === producto.maxPrecio && cotizaciones.length > 1
                            const estaSeleccionado = seleccionado?.cotizacionId === cot.id
                            
                            return (
                              <td 
                                key={cot.id} 
                                className={cn(
                                  'px-4 py-2 text-center transition-colors',
                                  esMejor && !estaSeleccionado && 'bg-emerald-50/50',
                                  esPeor && !estaSeleccionado && 'bg-red-50/50',
                                  estaSeleccionado && 'bg-primary/10 ring-2 ring-inset ring-primary'
                                )}
                              >
                                <button
                                  onClick={() => {
                                    if (estaSeleccionado) {
                                      quitarSeleccion(producto.nombre)
                                    } else if (precioInfo) {
                                      seleccionarProveedorParaProducto(producto.nombre, precioInfo)
                                    }
                                  }}
                                  className={cn(
                                    'w-full py-2 px-3 rounded-lg border-2 transition-all',
                                    estaSeleccionado 
                                      ? 'border-primary bg-primary/5' 
                                      : 'border-transparent hover:border-primary/30 hover:bg-muted/50'
                                  )}
                                >
                                  <div className={cn(
                                    'font-mono font-medium',
                                    esMejor && 'text-emerald-600',
                                    esPeor && 'text-red-600',
                                    estaSeleccionado && 'text-primary'
                                  )}>
                                    {formatCurrency(precioInfo?.subtotal || 0)}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-0.5">
                                    {formatCurrency(precioInfo?.precioUnitario || 0)}/u
                                    {precioInfo?.descuento ? ` (-${precioInfo.descuento}%)` : ''}
                                  </div>
                                  {esMejor && (
                                    <span className="inline-block text-xs text-emerald-600 font-medium mt-1">
                                      Mejor precio
                                    </span>
                                  )}
                                  {estaSeleccionado && (
                                    <div className="flex justify-center mt-1">
                                      <Check className="h-4 w-4 text-primary" />
                                    </div>
                                  )}
                                </button>
                              </td>
                            )
                          })}
                          <td className="px-4 py-3 text-center bg-primary/5">
                            {seleccionado ? (
                              <div>
                                <div className="text-xs text-muted-foreground truncate max-w-[120px] mx-auto" title={seleccionado.proveedorNombre}>
                                  {seleccionado.proveedorNombre.split(' ').slice(0, 2).join(' ')}
                                </div>
                                <div className="font-mono font-semibold text-primary">
                                  {formatCurrency(seleccionado.subtotal)}
                                </div>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin seleccionar</span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Resumen de selección por proveedor */}
          {resumenPorProveedor.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Resumen de Compra
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {resumenPorProveedor.map((proveedor) => (
                  <div 
                    key={proveedor.proveedorId}
                    className="border border-primary/30 bg-primary/5 rounded-lg p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                      <h4 className="font-medium text-foreground">{proveedor.proveedorNombre}</h4>
                    </div>
                    <ul className="space-y-1 mb-3">
                      {proveedor.productos.map((prod) => (
                        <li key={prod.productoNombre} className="flex justify-between text-sm">
                          <span className="text-muted-foreground truncate pr-2">{prod.productoNombre}</span>
                          <span className="font-mono text-foreground flex-shrink-0">{formatCurrency(prod.subtotal)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="pt-2 border-t border-border flex justify-between font-medium">
                      <span>Subtotal proveedor:</span>
                      <span className="font-mono text-primary">{formatCurrency(proveedor.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-border bg-muted/50">
          <div className="text-sm">
            {numSeleccionados > 0 ? (
              <div className="space-y-0.5">
                <div className="text-muted-foreground">
                  {numSeleccionados} de {totalProductos} productos seleccionados
                </div>
                <div className="font-semibold text-foreground">
                  Total: <span className="font-mono text-primary">{formatCurrency(totalSeleccion)}</span>
                </div>
              </div>
            ) : (
              <span className="text-muted-foreground">Haz clic en los precios para seleccionar proveedores</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
            {numSeleccionados === totalProductos && (
              <Button className="gap-2">
                <Check className="h-4 w-4" />
                Confirmar Selección
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal para ver comprobante */}
      {viewingComprobante && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70">
          <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-border">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                {getFileIcon(viewingComprobante.comprobanteTipo)}
                <h3 className="font-semibold text-foreground">Comprobante de Cotización</h3>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setViewingComprobante(null)} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 p-6 flex items-center justify-center bg-muted/30">
              <div className="text-center space-y-4">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto">
                  {viewingComprobante.comprobanteTipo === 'pdf' && <FileText className="h-12 w-12 text-red-500" />}
                  {viewingComprobante.comprobanteTipo === 'image' && <Image className="h-12 w-12 text-blue-500" />}
                  {viewingComprobante.comprobanteTipo === 'excel' && <FileSpreadsheet className="h-12 w-12 text-green-600" />}
                  {viewingComprobante.comprobanteTipo === 'word' && <FileText className="h-12 w-12 text-blue-600" />}
                </div>
                <div>
                  <p className="font-medium text-foreground">{viewingComprobante.proveedorNombre}</p>
                  <p className="text-sm text-muted-foreground">Cotización del {formatDate(viewingComprobante.fechaCotizacion)}</p>
                  <p className="text-xs text-muted-foreground mt-1 font-mono">{viewingComprobante.comprobanteUrl}</p>
                </div>
                <Button className="gap-2">
                  <Download className="h-4 w-4" />
                  Descargar Comprobante
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
