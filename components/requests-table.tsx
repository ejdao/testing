'use client'

import { useState, useMemo, useEffect } from 'react'
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, FileText, ClipboardCheck, BarChart3, ShoppingCart, FilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PriorityBadge } from '@/components/priority-badge'
import { cn } from '@/lib/utils'
import type { PurchaseRequest } from '@/lib/types'

type SortField = 'codigo' | 'dependencia' | 'tipoSolicitud' | 'estado' | 'usuario' | 'fechaCreacion' | 'ultimoCambioEstado' | 'totalFacturado' | 'prioridad'
type SortDirection = 'asc' | 'desc'

interface RequestsTableProps {
  requests: PurchaseRequest[]
  onViewProducts: (request: PurchaseRequest) => void
  onAddQuotation: (request: PurchaseRequest) => void
  onReviewRequest: (request: PurchaseRequest) => void
  onCompareQuotations: (request: PurchaseRequest) => void
  onApprovePurchase: (request: PurchaseRequest) => void
  onCreatePurchaseOrder: (request: PurchaseRequest) => void
}

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50]

const MONTHS_ES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

function formatDateString(date: Date): string {
  // Use UTC methods for consistent server/client rendering
  const day = date.getUTCDate()
  const month = MONTHS_ES[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  return `${day}/${month}/${year}`
}

function calculateTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) {
    return `${diffDays} día${diffDays > 1 ? 's' : ''}`
  } else if (diffHours > 0) {
    return `${diffHours} hora${diffHours > 1 ? 's' : ''}`
  } else {
    return 'Hace momentos'
  }
}

// Client-only component to display time ago without hydration mismatch
function TimeAgo({ date }: { date: Date }) {
  const [timeAgo, setTimeAgo] = useState<string>('')
  
  useEffect(() => {
    setTimeAgo(calculateTimeAgo(date))
  }, [date])
  
  if (!timeAgo) return null
  
  return <p className="text-xs text-muted-foreground">{timeAgo}</p>
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function RequestsTable({ requests, onViewProducts, onAddQuotation, onReviewRequest, onCompareQuotations, onApprovePurchase, onCreatePurchaseOrder }: RequestsTableProps) {
  const [sortField, setSortField] = useState<SortField>('fechaCreacion')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'codigo':
        case 'dependencia':
        case 'tipoSolicitud':
        case 'estado':
        case 'usuario':
          comparison = a[sortField].localeCompare(b[sortField])
          break
        case 'fechaCreacion':
        case 'ultimoCambioEstado':
          comparison = a[sortField].getTime() - b[sortField].getTime()
          break
        case 'totalFacturado':
          comparison = a.totalFacturado - b.totalFacturado
          break
        case 'prioridad':
          const priorityOrder = { 'CRITICA': 0, 'ALTA': 1, 'MEDIA': 2, 'BAJA': 3 }
          comparison = priorityOrder[a.prioridad] - priorityOrder[b.prioridad]
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [requests, sortField, sortDirection])

  const totalPages = Math.ceil(sortedRequests.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedRequests = sortedRequests.slice(startIndex, startIndex + itemsPerPage)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronUp className="h-3 w-3 text-muted-foreground/40" />
    return sortDirection === 'asc' 
      ? <ChevronUp className="h-3 w-3 text-primary" />
      : <ChevronDown className="h-3 w-3 text-primary" />
  }

  const SortableHeader = ({ field, children, className }: { field: SortField; children: React.ReactNode; className?: string }) => (
    <th className={cn('px-4 py-3 text-left', className)}>
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
      >
        {children}
        <SortIcon field={field} />
      </button>
    </th>
  )

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b border-border">
            <tr>
              <SortableHeader field="prioridad" className="w-16">Prio.</SortableHeader>
              <SortableHeader field="codigo">Código</SortableHeader>
              <SortableHeader field="dependencia">Dependencia</SortableHeader>
              <SortableHeader field="tipoSolicitud">Tipo</SortableHeader>
              <SortableHeader field="estado">Estado</SortableHeader>
              <SortableHeader field="usuario">Usuario</SortableHeader>
              <SortableHeader field="fechaCreacion">Creación</SortableHeader>
              <SortableHeader field="ultimoCambioEstado">Últ. Cambio</SortableHeader>
              <SortableHeader field="totalFacturado" className="text-right">Total</SortableHeader>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedRequests.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-muted-foreground">
                  No se encontraron solicitudes
                </td>
              </tr>
            ) : (
              paginatedRequests.map((request) => {
                return (
                  <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <PriorityBadge priority={request.prioridad} justification={request.justificacion} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {request.codigo}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[200px]">
                      <span className="text-sm text-foreground truncate block">
                        {request.dependencia}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex px-2 py-0.5 text-xs font-medium rounded',
                        request.tipoSolicitud === 'PRODUCTOS' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      )}>
                        {request.tipoSolicitud}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {request.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[180px]">
                      <div className="text-sm">
                        <p className="font-medium text-foreground truncate">{request.usuario}</p>
                        <p className="text-xs text-muted-foreground">{request.centroAtencion}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-foreground">{formatDateString(request.fechaCreacion)}</p>
                        <TimeAgo date={request.fechaCreacion} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <p className="text-foreground">{formatDateString(request.ultimoCambioEstado)}</p>
                        <TimeAgo date={request.ultimoCambioEstado} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={cn(
                        'font-mono text-sm',
                        request.totalFacturado > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'
                      )}>
                        {formatCurrency(request.totalFacturado)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewProducts(request)}
                          className="h-8 gap-1.5"
                          title="Ver detalle de solicitud"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span className="sr-only sm:not-sr-only sm:inline">Ver Detalle</span>
                        </Button>
                        {(request.estado === 'REGISTRADO' || request.estado === 'EN REVISIÓN') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReviewRequest(request)}
                            className="h-8 gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                            title="Revisar solicitud"
                          >
                            <ClipboardCheck className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:inline">Revisar</span>
                          </Button>
                        )}
                        {(request.estado === 'APROBADO PARA COTIZAR' || 
                          request.estado === 'EN PROCESO DE COTIZACIÓN' ||
                          request.estado === 'CON COTIZACIÓN(ES)' || 
                          request.estado === 'COTIZADO') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onAddQuotation(request)}
                            className="h-8 gap-1.5"
                            title="Agregar cotización"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:inline">Cotizar</span>
                          </Button>
                        )}
                        {(request.estado === 'CON COTIZACIÓN(ES)' || 
                          request.estado === 'COTIZADO') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCompareQuotations(request)}
                            className="h-8 gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                            title="Comparar cotizaciones"
                          >
                            <BarChart3 className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:inline">Comparar</span>
                          </Button>
                        )}
                        {(request.estado === 'COMPRA POR APROBAR' || 
                          request.estado === 'EN APROBACIÓN') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onApprovePurchase(request)}
                            className="h-8 gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-50"
                            title="Aprobar compra"
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:inline">Aprobar</span>
                          </Button>
                        )}
                        {(request.estado === 'COMPRA APROBADA' || 
                          request.estado === 'ORDEN PENDIENTE') && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onCreatePurchaseOrder(request)}
                            className="h-8 gap-1.5 border-teal-300 text-teal-700 hover:bg-teal-50"
                            title="Crear orden de compra"
                          >
                            <FilePlus className="h-3.5 w-3.5" />
                            <span className="sr-only sm:not-sr-only sm:inline">Crear OC</span>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-border bg-muted/30">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Mostrar</span>
          <select
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value))
              setCurrentPage(1)
            }}
            className="h-8 px-2 rounded border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {ITEMS_PER_PAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <span>por página</span>
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground mr-2">
            {startIndex + 1}-{Math.min(startIndex + itemsPerPage, sortedRequests.length)} de {sortedRequests.length}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Primera página</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Página anterior</span>
          </Button>
          
          <div className="flex items-center gap-1 mx-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <Button
                  key={pageNum}
                  variant={currentPage === pageNum ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Siguiente página</span>
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Última página</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
