'use client'

import { useState } from 'react'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { FilterState, Priority, RequestType } from '@/lib/types'
import { centrosAtencion } from '@/lib/mock-data'

interface FilterPanelProps {
  filters: FilterState
  onFiltersChange: (filters: FilterState) => void
  totalItems: number
  filteredItems: number
}

export function FilterPanel({ filters, onFiltersChange, totalItems, filteredItems }: FilterPanelProps) {
  const [showCentroDropdown, setShowCentroDropdown] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value })
  }

  const handleCentroChange = (value: string) => {
    onFiltersChange({ ...filters, centroAtencion: value })
    setShowCentroDropdown(false)
  }

  const handlePrioridadChange = (value: Priority | '') => {
    onFiltersChange({ ...filters, prioridad: value })
  }

  const handleTipoChange = (value: RequestType | '') => {
    onFiltersChange({ ...filters, tipoSolicitud: value })
  }

  const clearFilters = () => {
    onFiltersChange({
      search: '',
      centroAtencion: '',
      prioridad: '',
      tipoSolicitud: '',
      fechaDesde: '',
      fechaHasta: ''
    })
    setShowAdvancedFilters(false)
  }

  const hasActiveFilters = filters.search || filters.centroAtencion || filters.prioridad || filters.tipoSolicitud

  return (
    <div className="bg-card rounded-lg border border-border p-4 space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por código, dependencia, usuario..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        {/* Centro de Atención Filter */}
        <div className="relative">
          <Button
            variant="outline"
            onClick={() => setShowCentroDropdown(!showCentroDropdown)}
            className="flex items-center gap-2 min-w-[200px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="truncate">
                {filters.centroAtencion || 'Centro de Atención'}
              </span>
            </div>
            <ChevronDown className={cn('h-4 w-4 transition-transform', showCentroDropdown && 'rotate-180')} />
          </Button>
          
          {showCentroDropdown && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
              <button
                onClick={() => handleCentroChange('')}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors',
                  !filters.centroAtencion && 'bg-secondary font-medium'
                )}
              >
                Todos los centros
              </button>
              {centrosAtencion.map((centro) => (
                <button
                  key={centro}
                  onClick={() => handleCentroChange(centro)}
                  className={cn(
                    'w-full px-4 py-2.5 text-left text-sm hover:bg-secondary transition-colors border-t border-border',
                    filters.centroAtencion === centro && 'bg-secondary font-medium'
                  )}
                >
                  {centro}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="ghost"
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className="text-muted-foreground"
        >
          <Filter className="h-4 w-4 mr-2" />
          Más filtros
          <ChevronDown className={cn('h-4 w-4 ml-1 transition-transform', showAdvancedFilters && 'rotate-180')} />
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-destructive hover:text-destructive">
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}

        {/* Results Count */}
        <div className="ml-auto text-sm text-muted-foreground">
          Mostrando <span className="font-semibold text-foreground">{filteredItems}</span> de{' '}
          <span className="font-semibold text-foreground">{totalItems}</span> solicitudes
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <div className="pt-4 border-t border-border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Prioridad */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Prioridad
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['', 'BAJA', 'MEDIA', 'ALTA', 'CRITICA'] as (Priority | '')[]).map((p) => (
                <button
                  key={p || 'all'}
                  onClick={() => handlePrioridadChange(p)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                    filters.prioridad === p
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {p || 'Todas'}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo Solicitud */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Tipo de Solicitud
            </label>
            <div className="flex flex-wrap gap-1.5">
              {(['', 'PRODUCTOS', 'SERVICIOS'] as (RequestType | '')[]).map((t) => (
                <button
                  key={t || 'all'}
                  onClick={() => handleTipoChange(t)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-full transition-colors',
                    filters.tipoSolicitud === t
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  )}
                >
                  {t || 'Todos'}
                </button>
              ))}
            </div>
          </div>

          {/* Fecha Desde */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Desde
            </label>
            <Input
              type="date"
              value={filters.fechaDesde}
              onChange={(e) => onFiltersChange({ ...filters, fechaDesde: e.target.value })}
              className="bg-background"
            />
          </div>

          {/* Fecha Hasta */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Hasta
            </label>
            <Input
              type="date"
              value={filters.fechaHasta}
              onChange={(e) => onFiltersChange({ ...filters, fechaHasta: e.target.value })}
              className="bg-background"
            />
          </div>
        </div>
      )}
    </div>
  )
}
