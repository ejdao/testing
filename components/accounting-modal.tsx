'use client'

import { useState, useEffect, useMemo } from 'react'
import { X, Calculator, FileText, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { PurchaseRequest, CuotaProgramada, DatosContabilizacion } from '@/lib/types'

interface AccountingModalProps {
  request: PurchaseRequest | null
  ordenCompraConsecutivo: string
  cuota: CuotaProgramada | null
  onClose: () => void
  onSubmit: (data: DatosContabilizacion) => void
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
  const day = date.getUTCDate()
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']
  const month = months[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

export function AccountingModal({ 
  request, 
  ordenCompraConsecutivo, 
  cuota,
  onClose, 
  onSubmit 
}: AccountingModalProps) {
  const [consecutivoCuentaPagar, setConsecutivoCuentaPagar] = useState('')
  const [codigoComprobante, setCodigoComprobante] = useState('')
  const [retefuentePorcentaje, setRetefuentePorcentaje] = useState(0)
  const [reteicaPorcentaje, setReteicaPorcentaje] = useState(0)
  const [reteivaPorcentaje, setReteivaPorcentaje] = useState(0)
  const [descuentoAdicional, setDescuentoAdicional] = useState(0)
  const [observaciones, setObservaciones] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Calcular valores basados en el monto de la cuota
  const subtotal = useMemo(() => {
    if (!cuota) return 0
    // El subtotal es el monto sin IVA (asumiendo IVA del 19%)
    return Math.round(cuota.monto / 1.19)
  }, [cuota])

  const iva = useMemo(() => {
    if (!cuota) return 0
    return cuota.monto - subtotal
  }, [cuota, subtotal])

  const total = cuota?.monto ?? 0

  // Calcular retenciones
  const retefuenteValor = useMemo(() => {
    return Math.round(subtotal * (retefuentePorcentaje / 100))
  }, [subtotal, retefuentePorcentaje])

  const reteicaValor = useMemo(() => {
    return Math.round(subtotal * (reteicaPorcentaje / 100))
  }, [subtotal, reteicaPorcentaje])

  const reteivaaValor = useMemo(() => {
    return Math.round(iva * (reteivaPorcentaje / 100))
  }, [iva, reteivaPorcentaje])

  const totalRetencion = useMemo(() => {
    return retefuenteValor + reteicaValor + reteivaaValor
  }, [retefuenteValor, reteicaValor, reteivaaValor])

  const netoPagar = useMemo(() => {
    return total - totalRetencion - descuentoAdicional
  }, [total, totalRetencion, descuentoAdicional])

  // Fecha sugerida (hoy + 5 días hábiles aprox)
  const fechaSugerida = useMemo(() => {
    const fecha = new Date()
    fecha.setDate(fecha.getDate() + 7)
    return fecha
  }, [])

  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {}
    
    if (!consecutivoCuentaPagar.trim()) {
      nuevosErrores.consecutivo = 'El consecutivo de cuenta por pagar es requerido'
    }
    
    if (!codigoComprobante.trim()) {
      nuevosErrores.comprobante = 'El código del comprobante contable es requerido'
    }

    setErrors(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  const handleSubmit = () => {
    if (!validarFormulario() || !request || !cuota) return

    const data: DatosContabilizacion = {
      solicitudId: request.id,
      ordenCompraConsecutivo,
      cuotaNumero: cuota.numeroCuota,
      porcentaje: cuota.porcentaje,
      subtotal,
      descuentos: 0,
      iva,
      total,
      fechaSugerida,
      consecutivoCuentaPagar: consecutivoCuentaPagar.trim(),
      codigoComprobanteContable: codigoComprobante.trim(),
      retefuentePorcentaje,
      retefuenteValor,
      reteicaPorcentaje,
      reteicaValor,
      reteivaPorcentaje,
      reteivaaValor,
      descuentoAdicional,
      totalRetencion,
      netoPagar,
      observaciones: observaciones.trim()
    }

    onSubmit(data)
  }

  if (!request || !cuota) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-lg my-8 border border-border"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-foreground">
                Contabilizar Pago
              </h2>
              <p className="text-sm text-muted-foreground">
                {request.codigo} - {ordenCompraConsecutivo}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Información del pago */}
          <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
            <p className="text-sm font-medium text-foreground">
              Pago {cuota.numeroCuota} de {cuota.numeroCuota} por valor de{' '}
              <span className="font-bold text-primary">{formatCurrency(total)}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {cuota.porcentaje}% del valor facturado
            </p>
            <p className="text-sm text-muted-foreground">
              Fecha sugerida: <span className="font-medium">{formatDate(fechaSugerida)}</span>
            </p>
          </div>

          {/* Desglose de valores */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-mono font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Descuentos:</span>
                <span className="font-mono">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IVA:</span>
                <span className="font-mono">{formatCurrency(iva)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-medium">Total:</span>
                <span className="font-mono font-bold">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Campos de consecutivos */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="consecutivo" className="text-sm font-medium">
                Consecutivo Cuenta x pagar
              </Label>
              <Input
                id="consecutivo"
                type="text"
                placeholder="Ingrese el consecutivo"
                value={consecutivoCuentaPagar}
                onChange={(e) => setConsecutivoCuentaPagar(e.target.value)}
                className={cn(errors.consecutivo && 'border-destructive')}
              />
              {errors.consecutivo && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.consecutivo}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comprobante" className="text-sm font-medium">
                Código comprobante contable
              </Label>
              <Input
                id="comprobante"
                type="text"
                placeholder="Ingrese el código"
                value={codigoComprobante}
                onChange={(e) => setCodigoComprobante(e.target.value)}
                className={cn(errors.comprobante && 'border-destructive')}
              />
              {errors.comprobante && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.comprobante}
                </p>
              )}
            </div>
          </div>

          {/* Retenciones */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Retenciones</Label>
            <div className="bg-muted/20 rounded-lg border border-border overflow-hidden">
              {/* RETEFUENTE */}
              <div className="grid grid-cols-3 items-center border-b border-border">
                <div className="px-3 py-2 bg-muted/30 border-r border-border">
                  <Label className="text-xs font-medium">RETEFUENTE %</Label>
                </div>
                <div className="px-2 py-1 border-r border-border">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={retefuentePorcentaje || ''}
                    onChange={(e) => setRetefuentePorcentaje(parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="px-3 py-2 text-right">
                  <span className="font-mono text-sm">{formatCurrency(retefuenteValor)}</span>
                </div>
              </div>

              {/* RETEICA */}
              <div className="grid grid-cols-3 items-center border-b border-border">
                <div className="px-3 py-2 bg-muted/30 border-r border-border">
                  <Label className="text-xs font-medium">RETEICA %</Label>
                </div>
                <div className="px-2 py-1 border-r border-border">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={reteicaPorcentaje || ''}
                    onChange={(e) => setReteicaPorcentaje(parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="px-3 py-2 text-right">
                  <span className="font-mono text-sm">{formatCurrency(reteicaValor)}</span>
                </div>
              </div>

              {/* RETEIVA */}
              <div className="grid grid-cols-3 items-center border-b border-border">
                <div className="px-3 py-2 bg-muted/30 border-r border-border">
                  <Label className="text-xs font-medium">RETEIVA %</Label>
                </div>
                <div className="px-2 py-1 border-r border-border">
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={reteivaPorcentaje || ''}
                    onChange={(e) => setReteivaPorcentaje(parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="px-3 py-2 text-right">
                  <span className="font-mono text-sm">{formatCurrency(reteivaaValor)}</span>
                </div>
              </div>

              {/* Descuento */}
              <div className="grid grid-cols-3 items-center">
                <div className="px-3 py-2 bg-muted/30 border-r border-border">
                  <Label className="text-xs font-medium">Descuento</Label>
                </div>
                <div className="px-2 py-1 border-r border-border">
                  <Input
                    type="number"
                    min="0"
                    value={descuentoAdicional || ''}
                    onChange={(e) => setDescuentoAdicional(parseFloat(e.target.value) || 0)}
                    className="h-8 text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="px-3 py-2 text-right">
                  <span className="font-mono text-sm">{formatCurrency(descuentoAdicional)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Totales */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Retención:</span>
              <span className="font-mono">{formatCurrency(totalRetencion)}</span>
            </div>
            <div className="flex justify-between text-base pt-2 border-t border-border">
              <span className="font-semibold">Neto a pagar:</span>
              <span className="font-mono font-bold text-primary">{formatCurrency(netoPagar)}</span>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones" className="text-sm font-medium">
              Observaciones
            </Label>
            <Textarea
              id="observaciones"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value.slice(0, 1000))}
              placeholder="Ingrese observaciones adicionales..."
              className="min-h-[80px] resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground text-right">
              {observaciones.length}/1000
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/30">
          <Button variant="outline" onClick={onClose}>
            CANCELAR
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!consecutivoCuentaPagar.trim() || !codigoComprobante.trim()}
            className="bg-primary hover:bg-primary/90"
          >
            GRABAR
          </Button>
        </div>
      </div>
    </div>
  )
}

export type { DatosContabilizacion }
