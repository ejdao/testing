'use client'

import { useState, useEffect } from 'react'
import { X, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { PurchaseRequest, Priority } from '@/lib/types'

interface ReviewModalProps {
  request: PurchaseRequest | null
  onClose: () => void
  onSubmit: (data: ReviewData) => void
}

export interface ReviewData {
  requestId: string
  decision: 'APROBAR' | 'RECHAZAR'
  prioridad: Priority
  observaciones: string
}

const PRIORITY_OPTIONS: { value: Priority; label: string; color: string; bgColor: string }[] = [
  { value: 'BAJA', label: 'Baja', color: 'text-green-700', bgColor: 'bg-green-100 border-green-300' },
  { value: 'MEDIA', label: 'Media', color: 'text-yellow-700', bgColor: 'bg-yellow-100 border-yellow-300' },
  { value: 'ALTA', label: 'Alta', color: 'text-orange-700', bgColor: 'bg-orange-100 border-orange-300' },
  { value: 'CRITICA', label: 'Critica', color: 'text-red-700', bgColor: 'bg-red-100 border-red-300' },
]

const MAX_CHARS = 1000

export function ReviewModal({ request, onClose, onSubmit }: ReviewModalProps) {
  const [decision, setDecision] = useState<'APROBAR' | 'RECHAZAR' | null>(null)
  const [prioridad, setPrioridad] = useState<Priority>('MEDIA')
  const [observaciones, setObservaciones] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (request) {
      setPrioridad(request.prioridad)
      setDecision(null)
      setObservaciones('')
      setErrors({})
    }
  }, [request])

  if (!request) return null

  const handleObservacionesChange = (value: string) => {
    if (value.length <= MAX_CHARS) {
      setObservaciones(value)
      if (errors.observaciones) {
        setErrors(prev => ({ ...prev, observaciones: '' }))
      }
    }
  }

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!decision) {
      newErrors.decision = 'Debe seleccionar una decisión'
    }

    if (decision === 'RECHAZAR' && !observaciones.trim()) {
      newErrors.observaciones = 'Las observaciones son obligatorias al rechazar'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate() || !decision) return

    onSubmit({
      requestId: request.id,
      decision,
      prioridad,
      observaciones: observaciones.trim()
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col border border-border my-auto"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Revisar Solicitud
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              <span className="font-mono font-medium">{request.codigo}</span> · {request.dependencia}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
          {/* Request Info */}
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Usuario:</span>
                <p className="font-medium text-foreground">{request.usuario}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Centro:</span>
                <p className="font-medium text-foreground">{request.centroAtencion}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Tipo:</span>
                <p className="font-medium text-foreground">{request.tipoSolicitud}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Prioridad actual:</span>
                <p className="font-medium text-foreground">{request.prioridad}</p>
              </div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Justificación:</span>
              <p className="text-sm text-foreground mt-1">{request.justificacion}</p>
            </div>
          </div>

          {/* Decision */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Decisión <span className="text-destructive">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setDecision('APROBAR')
                  if (errors.decision) setErrors(prev => ({ ...prev, decision: '' }))
                }}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  decision === 'APROBAR'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-border hover:border-green-300 hover:bg-green-50/50'
                }`}
              >
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Aprobar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDecision('RECHAZAR')
                  if (errors.decision) setErrors(prev => ({ ...prev, decision: '' }))
                }}
                className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  decision === 'RECHAZAR'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-border hover:border-red-300 hover:bg-red-50/50'
                }`}
              >
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Rechazar</span>
              </button>
            </div>
            {errors.decision && (
              <p className="text-sm text-destructive">{errors.decision}</p>
            )}
          </div>

          {/* Priority Change */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground">
              Cambiar prioridad
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setPrioridad(option.value)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                    prioridad === option.value
                      ? `${option.bgColor} ${option.color} border-2`
                      : 'border-border bg-background hover:bg-muted/50'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observations */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-foreground">
                Observaciones {decision === 'RECHAZAR' && <span className="text-destructive">*</span>}
              </label>
              <span className={`text-xs ${observaciones.length >= MAX_CHARS ? 'text-destructive' : 'text-muted-foreground'}`}>
                {observaciones.length}/{MAX_CHARS}
              </span>
            </div>
            <Textarea
              value={observaciones}
              onChange={(e) => handleObservacionesChange(e.target.value)}
              placeholder={decision === 'RECHAZAR' 
                ? "Indique el motivo del rechazo..." 
                : "Observaciones adicionales (opcional)..."
              }
              rows={4}
              className={errors.observaciones ? 'border-destructive' : ''}
            />
            {errors.observaciones && (
              <p className="text-sm text-destructive">{errors.observaciones}</p>
            )}
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-border bg-muted/50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!decision}
            className={decision === 'RECHAZAR' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            {decision === 'APROBAR' && 'Confirmar Aprobación'}
            {decision === 'RECHAZAR' && 'Confirmar Rechazo'}
            {!decision && 'Seleccione decisión'}
          </Button>
        </div>
      </div>
    </div>
  )
}
