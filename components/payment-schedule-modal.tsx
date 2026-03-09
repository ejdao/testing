'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, AlertTriangle, Ban, Clock, DollarSign, Percent, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { PurchaseRequest, CuotaProgramada, ProgramacionPago, CancelacionCompra } from '@/lib/types'

interface PaymentScheduleModalProps {
  request: PurchaseRequest | null
  ordenCompraConsecutivo: string
  cuotas: CuotaProgramada[]
  onClose: () => void
  onSchedulePayment: (data: ProgramacionPago) => void
  onCancelPurchase: (data: CancelacionCompra) => void
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function PaymentScheduleModal({
  request,
  ordenCompraConsecutivo,
  cuotas,
  onClose,
  onSchedulePayment,
  onCancelPurchase
}: PaymentScheduleModalProps) {
  const [selectedCuota, setSelectedCuota] = useState<CuotaProgramada | null>(null)
  const [fechaProgramacion, setFechaProgramacion] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [motivoCancelacion, setMotivoCancelacion] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Seleccionar automáticamente la primera cuota pendiente
  useEffect(() => {
    const cuotaPendiente = cuotas.find(c => c.estado === 'PENDIENTE')
    if (cuotaPendiente) {
      setSelectedCuota(cuotaPendiente)
      // Establecer fecha por defecto como hoy
      const today = new Date()
      setFechaProgramacion(today.toISOString().split('T')[0])
    }
  }, [cuotas])

  if (!request) return null

  const cuotasPendientes = cuotas.filter(c => c.estado === 'PENDIENTE')
  const cuotasProgramadas = cuotas.filter(c => c.estado === 'PROGRAMADA')
  const cuotasPagadas = cuotas.filter(c => c.estado === 'PAGADA')

  const handleSchedule = () => {
    const nuevosErrores: Record<string, string> = {}

    if (!selectedCuota) {
      nuevosErrores.cuota = 'Debe seleccionar una cuota'
    }

    if (!fechaProgramacion) {
      nuevosErrores.fecha = 'La fecha de programación es requerida'
    }

    setErrors(nuevosErrores)

    if (Object.keys(nuevosErrores).length === 0 && selectedCuota) {
      onSchedulePayment({
        solicitudId: request.id,
        ordenCompraConsecutivo,
        cuotaNumero: selectedCuota.numeroCuota,
        porcentaje: selectedCuota.porcentaje,
        monto: selectedCuota.monto,
        plazoDias: selectedCuota.plazoDias,
        fechaLimite: selectedCuota.fechaLimite,
        fechaProgramacion: new Date(fechaProgramacion),
        observaciones
      })
    }
  }

  const handleCancelPurchase = () => {
    if (!motivoCancelacion.trim()) {
      setErrors({ cancelacion: 'El motivo de cancelación es requerido' })
      return
    }

    onCancelPurchase({
      solicitudId: request.id,
      ordenCompraConsecutivo,
      motivoCancelacion,
      fechaCancelacion: new Date()
    })
  }

  const diasRestantes = (fechaLimite: Date): number => {
    const hoy = new Date()
    const diffTime = fechaLimite.getTime() - hoy.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div 
          className="bg-background rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-border"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <div>
              <h2 id="modal-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Programar Pago
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Solicitud {request.codigo} - OC: {ordenCompraConsecutivo}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Resumen de cuotas */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-amber-700">{cuotasPendientes.length}</p>
                <p className="text-xs text-amber-600">Pendientes</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">{cuotasProgramadas.length}</p>
                <p className="text-xs text-blue-600">Programadas</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
                <p className="text-2xl font-bold text-emerald-700">{cuotasPagadas.length}</p>
                <p className="text-xs text-emerald-600">Pagadas</p>
              </div>
            </div>

            {/* Lista de cuotas */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Seleccione la cuota a programar</Label>
              <div className="space-y-2">
                {cuotas.map((cuota) => {
                  const dias = diasRestantes(cuota.fechaLimite)
                  const isSelected = selectedCuota?.numeroCuota === cuota.numeroCuota
                  const isPendiente = cuota.estado === 'PENDIENTE'
                  const isVencida = dias < 0 && isPendiente

                  return (
                    <button
                      key={cuota.numeroCuota}
                      onClick={() => isPendiente && setSelectedCuota(cuota)}
                      disabled={!isPendiente}
                      className={cn(
                        'w-full p-4 rounded-lg border-2 text-left transition-all',
                        isPendiente && !isSelected && 'border-border hover:border-primary/50 bg-background',
                        isSelected && 'border-primary bg-primary/5',
                        !isPendiente && 'border-border bg-muted/30 cursor-not-allowed opacity-60'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold',
                            isPendiente && !isVencida && 'bg-amber-100 text-amber-700',
                            cuota.estado === 'PROGRAMADA' && 'bg-blue-100 text-blue-700',
                            cuota.estado === 'PAGADA' && 'bg-emerald-100 text-emerald-700',
                            isVencida && 'bg-red-100 text-red-700'
                          )}>
                            {cuota.numeroCuota}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              Cuota {cuota.numeroCuota} de {cuotas.length}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Percent className="h-3.5 w-3.5" />
                                {cuota.porcentaje}%
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3.5 w-3.5" />
                                {formatCurrency(cuota.monto)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">Plazo: {cuota.plazoDias} días</span>
                          </div>
                          <p className={cn(
                            'text-sm font-medium',
                            isPendiente && !isVencida && 'text-foreground',
                            isVencida && 'text-red-600'
                          )}>
                            Límite: {formatDate(cuota.fechaLimite)}
                          </p>
                          {isPendiente && (
                            <p className={cn(
                              'text-xs mt-0.5',
                              dias > 5 && 'text-emerald-600',
                              dias <= 5 && dias > 0 && 'text-amber-600',
                              dias <= 0 && 'text-red-600 font-medium'
                            )}>
                              {dias > 0 ? `${dias} días restantes` : dias === 0 ? 'Vence hoy' : `Vencida hace ${Math.abs(dias)} días`}
                            </p>
                          )}
                          {cuota.estado === 'PROGRAMADA' && (
                            <span className="inline-block text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1">
                              Programada: {cuota.fechaProgramacion && formatDate(cuota.fechaProgramacion)}
                            </span>
                          )}
                          {cuota.estado === 'PAGADA' && (
                            <span className="inline-block text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded mt-1">
                              Pagada
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
              {errors.cuota && (
                <p className="text-xs text-destructive">{errors.cuota}</p>
              )}
            </div>

            {/* Formulario de programación */}
            {selectedCuota && (
              <div className="bg-muted/30 rounded-lg p-4 space-y-4 border border-border">
                <h3 className="font-medium text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Detalles de la Programación - Cuota {selectedCuota.numeroCuota}
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground">Porcentaje a pagar</p>
                    <p className="text-xl font-bold text-primary">{selectedCuota.porcentaje}%</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground">Monto a pagar</p>
                    <p className="text-xl font-bold text-foreground">{formatCurrency(selectedCuota.monto)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground">Plazo de pago</p>
                    <p className="font-semibold text-foreground">{selectedCuota.plazoDias} días</p>
                  </div>
                  <div className="bg-background rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground">Fecha límite</p>
                    <p className="font-semibold text-foreground">{formatDate(selectedCuota.fechaLimite)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaProgramacion" className="text-sm font-medium">
                    Fecha de Programación <span className="text-destructive">*</span>
                  </Label>
                  <input
                    type="date"
                    id="fechaProgramacion"
                    value={fechaProgramacion}
                    onChange={(e) => setFechaProgramacion(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 rounded-md border bg-background text-foreground',
                      errors.fecha ? 'border-destructive' : 'border-input'
                    )}
                  />
                  {errors.fecha && (
                    <p className="text-xs text-destructive">{errors.fecha}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones" className="text-sm font-medium">
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    placeholder="Ingrese observaciones sobre esta programación..."
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/30">
            <Button 
              variant="destructive" 
              onClick={() => setShowCancelModal(true)}
              className="gap-2"
            >
              <Ban className="h-4 w-4" />
              Cancelar Compra
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose}>
                Cerrar
              </Button>
              <Button 
                onClick={handleSchedule}
                disabled={!selectedCuota || !fechaProgramacion}
                className="gap-2"
              >
                <Calendar className="h-4 w-4" />
                Programar Pago
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cancelación */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-md border border-border">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-destructive">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Cancelar Compra</h3>
                  <p className="text-sm text-muted-foreground">Esta acción no se puede deshacer</p>
                </div>
              </div>

              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
                <p className="text-sm text-destructive">
                  Está a punto de cancelar la orden de compra <span className="font-semibold">{ordenCompraConsecutivo}</span> 
                  {' '}de la solicitud <span className="font-semibold">{request.codigo}</span>.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivoCancelacion" className="text-sm font-medium">
                  Motivo de cancelación <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="motivoCancelacion"
                  placeholder="Explique el motivo de la cancelación..."
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  className={cn(
                    'min-h-[100px]',
                    errors.cancelacion && 'border-destructive'
                  )}
                />
                {errors.cancelacion && (
                  <p className="text-xs text-destructive">{errors.cancelacion}</p>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setShowCancelModal(false)}>
                  Volver
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleCancelPurchase}
                  disabled={!motivoCancelacion.trim()}
                  className="gap-2"
                >
                  <Ban className="h-4 w-4" />
                  Confirmar Cancelación
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export type { ProgramacionPago, CancelacionCompra }
