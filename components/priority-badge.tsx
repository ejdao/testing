'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { Priority } from '@/lib/types'

interface PriorityBadgeProps {
  priority: Priority
  justification: string
}

const priorityConfig: Record<Priority, { color: string; bgColor: string; label: string }> = {
  CRITICA: { 
    color: 'bg-red-500', 
    bgColor: 'bg-red-50 border-red-200',
    label: 'Crítica' 
  },
  ALTA: { 
    color: 'bg-orange-500', 
    bgColor: 'bg-orange-50 border-orange-200',
    label: 'Alta' 
  },
  MEDIA: { 
    color: 'bg-yellow-500', 
    bgColor: 'bg-yellow-50 border-yellow-200',
    label: 'Media' 
  },
  BAJA: { 
    color: 'bg-green-500', 
    bgColor: 'bg-green-50 border-green-200',
    label: 'Baja' 
  },
}

export function PriorityBadge({ priority, justification }: PriorityBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const config = priorityConfig[priority]

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/30 rounded"
        aria-label={`Prioridad ${config.label}: ${justification}`}
      >
        <span className={cn('w-3 h-3 rounded-full', config.color)} />
      </button>
      
      {showTooltip && (
        <div 
          className={cn(
            'absolute left-0 top-full mt-2 z-50 w-64 p-3 rounded-lg border shadow-lg',
            config.bgColor
          )}
          role="tooltip"
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn('w-2.5 h-2.5 rounded-full', config.color)} />
            <span className="text-sm font-semibold text-foreground">
              Prioridad {config.label}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            <span className="font-medium text-foreground">Justificación:</span> {justification}
          </p>
        </div>
      )}
    </div>
  )
}

export function PriorityLegend() {
  return (
    <div className="flex items-center gap-1">
      {(['BAJA', 'MEDIA', 'ALTA', 'CRITICA'] as Priority[]).map((priority) => {
        const config = priorityConfig[priority]
        return (
          <div
            key={priority}
            className={cn(
              'px-2.5 py-1 text-xs font-semibold rounded',
              priority === 'BAJA' && 'bg-green-500 text-white',
              priority === 'MEDIA' && 'bg-yellow-500 text-white',
              priority === 'ALTA' && 'bg-orange-500 text-white',
              priority === 'CRITICA' && 'bg-red-500 text-white'
            )}
          >
            {config.label}
          </div>
        )
      })}
    </div>
  )
}
