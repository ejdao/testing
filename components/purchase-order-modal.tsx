'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, FileText, CreditCard, Percent, Calendar, AlertCircle, Plus, Minus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import type { PurchaseRequest, TipoPago, CuotaPago, OrdenCompra, RecomendacionCompra } from '@/lib/types'

interface PurchaseOrderModalProps {
  request: PurchaseRequest | null
  recomendacion: RecomendacionCompra | null
  onClose: () => void
  onSubmit: (data: OrdenCompra) => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

// Generar consecutivo de orden de compra
function generateConsecutivo(): string {
  const year = new Date().getFullYear()
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `OC-${year}-${random}`
}

const TIPO_PAGO_OPTIONS: { value: TipoPago; label: string; description: string }[] = [
  { value: 'ANTICIPO', label: 'Anticipo', description: 'Pago total por adelantado' },
  { value: 'CREDITO', label: 'Crédito', description: 'Pago en cuotas después de recibir' },
  { value: 'CREDIANTICIPO', label: 'Crédianticipo', description: 'Anticipo parcial + cuotas restantes' }
]

export function PurchaseOrderModal({ request, recomendacion, onClose, onSubmit }: PurchaseOrderModalProps) {
  const [consecutivo] = useState(() => generateConsecutivo())
  const [tipoPago, setTipoPago] = useState<TipoPago>('ANTICIPO')
  const [numeroCuotas, setNumeroCuotas] = useState(1)
  const [cuotas, setCuotas] = useState<CuotaPago[]>([])
  const [ultimoPagoAlFinalizar, setUltimoPagoAlFinalizar] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalOrden = recomendacion?.totalGeneral || 0

  // Calcular cuotas cuando cambia el número de cuotas o el total
  useEffect(() => {
    if (tipoPago === 'ANTICIPO') {
      setCuotas([{ numeroCuota: 1, porcentaje: 100, monto: totalOrden }])
      return
    }

    const porcentajePorCuota = Math.floor(100 / numeroCuotas)
    const porcentajeRestante = 100 - (porcentajePorCuota * numeroCuotas)
    
    const nuevasCuotas: CuotaPago[] = Array.from({ length: numeroCuotas }, (_, i) => {
      // La última cuota recibe el porcentaje restante
      const porcentaje = i === numeroCuotas - 1 
        ? porcentajePorCuota + porcentajeRestante 
        : porcentajePorCuota
      
      return {
        numeroCuota: i + 1,
        porcentaje,
        monto: Math.round(totalOrden * porcentaje / 100)
      }
    })
    
    setCuotas(nuevasCuotas)
  }, [tipoPago, numeroCuotas, totalOrden])

  // Recalcular montos cuando cambian los porcentajes
  const actualizarPorcentajeCuota = (index: number, nuevoPorcentaje: number) => {
    const nuevasCuotas = cuotas.map((cuota, i) => {
      if (i === index) {
        return {
          ...cuota,
          porcentaje: nuevoPorcentaje,
          monto: Math.round(totalOrden * nuevoPorcentaje / 100)
        }
      }
      return cuota
    })
    setCuotas(nuevasCuotas)
  }

  const totalPorcentaje = useMemo(() => {
    return cuotas.reduce((sum, cuota) => sum + cuota.porcentaje, 0)
  }, [cuotas])

  const totalMontos = useMemo(() => {
    return cuotas.reduce((sum, cuota) => sum + cuota.monto, 0)
  }, [cuotas])

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {}
    
    if (totalPorcentaje !== 100) {
      nuevosErrores.porcentaje = `El total de porcentajes debe ser 100%. Actual: ${totalPorcentaje}%`
    }

    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = () => {
    if (!validarFormulario()) return

    const ordenCompra: OrdenCompra = {
      consecutivo,
      solicitudId: request?.id || '',
      tipoPago,
      numeroCuotas: tipoPago === 'ANTICIPO' ? 1 : numeroCuotas,
      cuotas,
      ultimoPagoAlFinalizar,
      totalOrden,
      fechaCreacion: new Date()
    }

    onSubmit(ordenCompra)
  }

  if (!request) return null

  const requiresCuotas = tipoPago === 'CREDITO' || tipoPago === 'CREDIANTICIPO'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-card rounded-xl shadow-2xl border border-border my-8"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-foreground">
                Crear Orden de Compra
              </h2>
              <p className="text-sm text-muted-foreground">
                Solicitud: {request.codigo}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Total de la Orden */}
          <div className="bg-muted/50 rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-muted-foreground">Total de la Orden</Label>
                <p className="text-xl font-mono font-bold text-foreground">{formatCurrency(totalOrden)}</p>
              </div>
            </div>
          </div>

          {/* Tipo de Pago */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipo de Pago</Label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TIPO_PAGO_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTipoPago(option.value)
                    if (option.value === 'ANTICIPO') {
                      setNumeroCuotas(1)
                      setUltimoPagoAlFinalizar(false)
                    } else {
                      setNumeroCuotas(2)
                    }
                  }}
                  className={cn(
                    'relative flex flex-col items-start p-4 rounded-lg border-2 transition-all text-left',
                    tipoPago === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <CreditCard className={cn(
                      'h-4 w-4',
                      tipoPago === option.value ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <span className={cn(
                      'font-medium',
                      tipoPago === option.value ? 'text-primary' : 'text-foreground'
                    )}>
                      {option.label}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                  {tipoPago === option.value && (
                    <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Número de Cuotas - Solo si es Crédito o Crédianticipo */}
          {requiresCuotas && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Número de Cuotas</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setNumeroCuotas(Math.max(1, numeroCuotas - 1))}
                    disabled={numeroCuotas <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center font-mono font-bold text-lg">{numeroCuotas}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setNumeroCuotas(Math.min(12, numeroCuotas + 1))}
                    disabled={numeroCuotas >= 12}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Detalle de Cuotas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Distribución de Cuotas</Label>
                  {totalPorcentaje !== 100 && (
                    <span className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Total: {totalPorcentaje}% (debe ser 100%)
                    </span>
                  )}
                </div>
                
                <div className="bg-muted/30 rounded-lg border border-border overflow-hidden">
                  <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 border-b border-border text-xs font-medium text-muted-foreground">
                    <div className="col-span-2">Cuota</div>
                    <div className="col-span-5">Porcentaje</div>
                    <div className="col-span-5 text-right">Monto</div>
                  </div>
                  <div className="divide-y divide-border">
                    {cuotas.map((cuota, index) => (
                      <div key={cuota.numeroCuota} className="grid grid-cols-12 gap-2 p-3 items-center">
                        <div className="col-span-2">
                          <span className="text-sm font-medium text-foreground">
                            #{cuota.numeroCuota}
                          </span>
                        </div>
                        <div className="col-span-5">
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={cuota.porcentaje}
                              onChange={(e) => actualizarPorcentajeCuota(index, Number(e.target.value))}
                              className="h-8 w-20 text-center font-mono"
                            />
                            <Percent className="h-4 w-4 text-muted-foreground" />
                          </div>
                        </div>
                        <div className="col-span-5 text-right">
                          <span className="font-mono text-sm text-foreground">
                            {formatCurrency(cuota.monto)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-12 gap-2 p-3 bg-muted/50 border-t border-border">
                    <div className="col-span-2 text-sm font-medium">Total</div>
                    <div className="col-span-5">
                      <span className={cn(
                        'font-mono text-sm font-bold',
                        totalPorcentaje === 100 ? 'text-emerald-600' : 'text-destructive'
                      )}>
                        {totalPorcentaje}%
                      </span>
                    </div>
                    <div className="col-span-5 text-right">
                      <span className="font-mono text-sm font-bold text-foreground">
                        {formatCurrency(totalMontos)}
                      </span>
                    </div>
                  </div>
                </div>

                {errors.porcentaje && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.porcentaje}
                  </p>
                )}
              </div>

              {/* Último pago al finalizar */}
              <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <Label className="text-sm font-medium cursor-pointer" htmlFor="ultimo-pago">
                      Último pago al finalizar el trabajo
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      La última cuota se pagará al completar el servicio o entrega
                    </p>
                  </div>
                </div>
                <Switch
                  id="ultimo-pago"
                  checked={ultimoPagoAlFinalizar}
                  onCheckedChange={setUltimoPagoAlFinalizar}
                />
              </div>
            </div>
          )}

          {/* Resumen para Anticipo */}
          {tipoPago === 'ANTICIPO' && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Pago Anticipado Total</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Se realizará el pago completo de <span className="font-mono font-bold">{formatCurrency(totalOrden)}</span> antes de recibir los productos o servicios.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={requiresCuotas && totalPorcentaje !== 100}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            Crear Orden de Compra
          </Button>
        </div>
      </div>
    </div>
  )
}

export type { OrdenCompra }
