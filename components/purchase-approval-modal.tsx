'use client'

import { useState, useMemo } from 'react'
import { 
  X, 
  CheckCircle2, 
  XCircle, 
  User, 
  Calendar, 
  Building2, 
  FileText,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  DollarSign,
  Package,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { PurchaseRequest, CotizacionGuardada, RecomendacionCompra, SeleccionProducto } from '@/lib/types'

interface PurchaseApprovalModalProps {
  request: PurchaseRequest | null
  cotizaciones: CotizacionGuardada[]
  recomendacion: RecomendacionCompra | null
  onClose: () => void
  onSubmit: (data: PurchaseApprovalData) => void
  onViewComparison: () => void
}

export interface PurchaseApprovalData {
  solicitudId: string
  decision: 'APROBADO' | 'RECHAZADO'
  observaciones: string
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

export function PurchaseApprovalModal({ 
  request, 
  cotizaciones,
  recomendacion,
  onClose, 
  onSubmit,
  onViewComparison
}: PurchaseApprovalModalProps) {
  const [decision, setDecision] = useState<'APROBADO' | 'RECHAZADO' | null>(null)
  const [observaciones, setObservaciones] = useState('')
  const [showProveedorDetails, setShowProveedorDetails] = useState<string | null>(null)
  const [errors, setErrors] = useState<{ observaciones?: string }>({})

  // Agrupar selecciones por proveedor
  const seleccionesPorProveedor = useMemo(() => {
    if (!recomendacion) return []
    
    const grouped: Record<string, { 
      proveedor: string; 
      proveedorId: string;
      items: SeleccionProducto[]; 
      total: number;
      cotizacion: CotizacionGuardada | undefined;
    }> = {}
    
    recomendacion.selecciones.forEach(sel => {
      if (!grouped[sel.proveedorId]) {
        grouped[sel.proveedorId] = {
          proveedor: sel.proveedorNombre,
          proveedorId: sel.proveedorId,
          items: [],
          total: 0,
          cotizacion: cotizaciones.find(c => c.proveedorId === sel.proveedorId)
        }
      }
      grouped[sel.proveedorId].items.push(sel)
      grouped[sel.proveedorId].total += sel.subtotal
    })
    
    return Object.values(grouped)
  }, [recomendacion, cotizaciones])

  if (!request || !recomendacion) return null

  const handleSubmit = () => {
    const newErrors: { observaciones?: string } = {}
    
    if (!decision) return
    
    if (decision === 'RECHAZADO' && !observaciones.trim()) {
      newErrors.observaciones = 'Las observaciones son obligatorias al rechazar'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    onSubmit({
      solicitudId: request.id,
      decision,
      observaciones: observaciones.trim()
    })
  }

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />
      case 'image': return <FileText className="h-4 w-4 text-blue-500" />
      case 'excel': return <FileText className="h-4 w-4 text-green-500" />
      case 'word': return <FileText className="h-4 w-4 text-blue-600" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border my-auto"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Aprobar Compra
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Solicitud <span className="font-mono font-medium">{request.codigo}</span> · {request.dependencia}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          {/* Info de recomendación */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Recomendado por</p>
                  <p className="text-sm text-muted-foreground">{recomendacion.usuarioRecomendador}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Fecha recomendación</p>
                <p className="text-sm font-medium text-foreground">{formatDate(recomendacion.fechaRecomendacion)}</p>
              </div>
            </div>
            {recomendacion.observacionesRecomendador && (
              <div className="mt-3 pt-3 border-t border-primary/10">
                <p className="text-sm text-muted-foreground italic">
                  "{recomendacion.observacionesRecomendador}"
                </p>
              </div>
            )}
          </div>

          {/* Resumen de compra */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Package className="h-4 w-4 text-primary" />
                Items Recomendados por Proveedor
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onViewComparison}
                className="gap-1.5"
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Ver Comparativa Original
              </Button>
            </div>

            <div className="space-y-3">
              {seleccionesPorProveedor.map((grupo) => (
                <div key={grupo.proveedorId} className="bg-background rounded-lg border border-border overflow-hidden">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setShowProveedorDetails(
                      showProveedorDetails === grupo.proveedorId ? null : grupo.proveedorId
                    )}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        setShowProveedorDetails(
                          showProveedorDetails === grupo.proveedorId ? null : grupo.proveedorId
                        )
                      }
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <div className="text-left">
                        <p className="font-medium text-foreground">{grupo.proveedor}</p>
                        <p className="text-xs text-muted-foreground">
                          {grupo.items.length} producto{grupo.items.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-mono font-semibold text-foreground">{formatCurrency(grupo.total)}</p>
                      </div>
                      {grupo.cotizacion && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            window.open(grupo.cotizacion!.comprobanteUrl, '_blank')
                          }}
                          className="h-8 gap-1.5"
                          title="Ver comprobante"
                        >
                          {getFileIcon(grupo.cotizacion.comprobanteTipo)}
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      )}
                      {showProveedorDetails === grupo.proveedorId ? (
                        <ChevronUp className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {showProveedorDetails === grupo.proveedorId && (
                    <div className="border-t border-border">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">Producto</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Cant.</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Precio Unit.</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Desc.</th>
                            <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">Subtotal</th>
                            <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">IVA</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {grupo.items.map((item) => (
                            <tr key={item.productoId} className="hover:bg-muted/20">
                              <td className="px-4 py-2">
                                <div className="flex items-center gap-2">
                                  {item.esMejorPrecio && (
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Mejor precio" />
                                  )}
                                  <span className="text-sm text-foreground">{item.productoNombre}</span>
                                </div>
                              </td>
                              <td className="px-4 py-2 text-right text-sm text-foreground">{item.cantidad}</td>
                              <td className="px-4 py-2 text-right text-sm font-mono text-foreground">
                                {formatCurrency(item.precioUnitario)}
                              </td>
                              <td className="px-4 py-2 text-right text-sm text-foreground">
                                {item.descuento > 0 ? `${item.descuento}%` : '-'}
                              </td>
                              <td className="px-4 py-2 text-right text-sm font-mono font-medium text-foreground">
                                {formatCurrency(item.subtotal)}
                              </td>
                              <td className="px-4 py-2 text-center">
                                {item.incluyeIva ? (
                                  <span className="text-xs text-emerald-600 font-medium">Incluido</span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">No</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total general */}
            <div className="mt-4 flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/20">
              <span className="font-medium text-foreground">Total General de la Compra</span>
              <span className="font-mono text-xl font-bold text-primary">
                {formatCurrency(recomendacion.totalGeneral)}
              </span>
            </div>
          </div>

          {/* Decisión */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Decisión</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  setDecision('APROBADO')
                  setErrors({})
                }}
                className={cn(
                  'flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all',
                  decision === 'APROBADO'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                    : 'border-border hover:border-emerald-300 hover:bg-emerald-50/50'
                )}
              >
                <CheckCircle2 className={cn(
                  'h-6 w-6',
                  decision === 'APROBADO' ? 'text-emerald-500' : 'text-muted-foreground'
                )} />
                <span className="font-medium">Aprobar Compra</span>
              </button>
              <button
                onClick={() => {
                  setDecision('RECHAZADO')
                  setErrors({})
                }}
                className={cn(
                  'flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-all',
                  decision === 'RECHAZADO'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-border hover:border-red-300 hover:bg-red-50/50'
                )}
              >
                <XCircle className={cn(
                  'h-6 w-6',
                  decision === 'RECHAZADO' ? 'text-red-500' : 'text-muted-foreground'
                )} />
                <span className="font-medium">Rechazar Compra</span>
              </button>
            </div>
          </div>

          {/* Observaciones */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                Observaciones
                {decision === 'RECHAZADO' && (
                  <span className="text-xs text-red-500 font-normal">(Obligatorio al rechazar)</span>
                )}
              </label>
              <span className={cn(
                'text-xs',
                observaciones.length > 1000 ? 'text-red-500' : 'text-muted-foreground'
              )}>
                {observaciones.length}/1000
              </span>
            </div>
            <textarea
              value={observaciones}
              onChange={(e) => {
                if (e.target.value.length <= 1000) {
                  setObservaciones(e.target.value)
                  if (errors.observaciones) {
                    setErrors({})
                  }
                }
              }}
              rows={3}
              className={cn(
                'w-full px-3 py-2 rounded-lg border bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30',
                errors.observaciones ? 'border-red-500' : 'border-border'
              )}
              placeholder={
                decision === 'RECHAZADO' 
                  ? 'Ingrese el motivo del rechazo...' 
                  : 'Observaciones adicionales (opcional)...'
              }
            />
            {errors.observaciones && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                {errors.observaciones}
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!decision}
            className={cn(
              decision === 'APROBADO' && 'bg-emerald-600 hover:bg-emerald-700',
              decision === 'RECHAZADO' && 'bg-red-600 hover:bg-red-700'
            )}
          >
            {decision === 'APROBADO' && 'Confirmar Aprobación'}
            {decision === 'RECHAZADO' && 'Confirmar Rechazo'}
            {!decision && 'Seleccione una opción'}
          </Button>
        </div>
      </div>
    </div>
  )
}
