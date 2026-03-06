'use client'

import { cn } from '@/lib/utils'
import type { RequestStatus } from '@/lib/types'
import {
  Plus,
  ClipboardList,
  CheckCircle,
  FileText,
  ShoppingCart,
  Clock,
  Calendar,
  Calculator,
  CreditCard,
  CheckSquare
} from 'lucide-react'

interface StepperStep {
  id: RequestStatus
  label: string
  count: number
  icon: React.ReactNode
}

interface WorkflowStepperProps {
  activeStep: RequestStatus
  onStepClick: (step: RequestStatus) => void
  stepCounts: Record<RequestStatus, number>
}

const stepConfig: { id: RequestStatus; label: string; icon: React.ReactNode }[] = [
  { id: 'NO_ASIGNADAS', label: 'No Asignadas', icon: <Plus className="h-4 w-4" /> },
  { id: 'REGISTRADOS', label: 'Registrados', icon: <ClipboardList className="h-4 w-4" /> },
  { id: 'APROBADAS_COTIZAR', label: 'Aprobadas para Cotizar', icon: <CheckCircle className="h-4 w-4" /> },
  { id: 'CON_COTIZACIONES', label: 'Con Cotizaciones', icon: <FileText className="h-4 w-4" /> },
  { id: 'COMPRAS_APROBAR', label: 'Compras por Aprobar', icon: <ShoppingCart className="h-4 w-4" /> },
  { id: 'ORDENES_PENDIENTES', label: 'Órdenes Pendientes', icon: <Clock className="h-4 w-4" /> },
  { id: 'PENDIENTES_PROGRAMAR', label: 'Por Programar OC', icon: <Calendar className="h-4 w-4" /> },
  { id: 'PENDIENTES_CONTABILIZAR', label: 'Por Contabilizar OC', icon: <Calculator className="h-4 w-4" /> },
  { id: 'PENDIENTES_PAGAR', label: 'Por Pagar OC', icon: <CreditCard className="h-4 w-4" /> },
  { id: 'FINALIZADO', label: 'Finalizados', icon: <CheckSquare className="h-4 w-4" /> },
]

export function WorkflowStepper({ activeStep, onStepClick, stepCounts }: WorkflowStepperProps) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex items-center justify-between min-w-max gap-1">
        {stepConfig.map((step, index) => {
          const isActive = activeStep === step.id
          const count = stepCounts[step.id] || 0
          
          return (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => onStepClick(step.id)}
                className={cn(
                  'flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200 min-w-[100px]',
                  'hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-primary/30',
                  isActive && 'bg-primary text-primary-foreground shadow-md'
                )}
              >
                <div className={cn(
                  'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
                  isActive ? 'bg-primary-foreground/20' : 'bg-muted'
                )}>
                  {step.icon}
                </div>
                <div className="text-center">
                  <p className={cn(
                    'text-lg font-bold leading-none',
                    isActive ? 'text-primary-foreground' : 'text-foreground'
                  )}>
                    {count}
                  </p>
                  <p className={cn(
                    'text-[10px] font-medium leading-tight mt-0.5 max-w-[80px]',
                    isActive ? 'text-primary-foreground/90' : 'text-muted-foreground'
                  )}>
                    {step.label}
                  </p>
                </div>
              </button>
              
              {index < stepConfig.length - 1 && (
                <div className="w-6 h-px bg-border mx-1" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
