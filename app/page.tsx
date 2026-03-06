'use client'

import { useState, useMemo, useCallback } from 'react'
import { RefreshCw, Calendar, CalendarDays, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { WorkflowStepper } from '@/components/workflow-stepper'
import { FilterPanel } from '@/components/filter-panel'
import { RequestsTable } from '@/components/requests-table'
import { RequestDetailModal } from '@/components/request-detail-modal'
import { RequestFormModal } from '@/components/request-form-modal'
import { QuotationModal } from '@/components/quotation-modal'
import { ReviewModal, type ReviewData } from '@/components/review-modal'
import { QuotationComparisonModal } from '@/components/quotation-comparison-modal'
import { PurchaseApprovalModal, type PurchaseApprovalData } from '@/components/purchase-approval-modal'
import { PurchaseOrderModal, type OrdenCompra } from '@/components/purchase-order-modal'
import { PriorityLegend } from '@/components/priority-badge'
import { generateMockRequests, stepperData, generateMockProducts, generateMockCotizaciones, generateMockRecomendacion } from '@/lib/mock-data'
import type { RequestStatus, PurchaseRequest, FilterState, CotizacionGuardada, RecomendacionCompra } from '@/lib/types'

// Helper to format date for input
const formatDateForInput = (date: Date) => {
  return date.toISOString().split('T')[0]
}

export default function PurchaseRequestsPage() {
  const [activeStep, setActiveStep] = useState<RequestStatus>('REGISTRADOS')
  const [selectedRequest, setSelectedRequest] = useState<PurchaseRequest | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    centroAtencion: '',
    prioridad: '',
    tipoSolicitud: '',
    fechaDesde: '',
    fechaHasta: ''
  })
  const [isRefreshing, setIsRefreshing] = useState(false)
  
  // Date range for query
  const today = new Date()
  const thirtyDaysAgo = new Date(today)
  thirtyDaysAgo.setDate(today.getDate() - 30)
  
  const [dateRange, setDateRange] = useState({
    desde: formatDateForInput(thirtyDaysAgo),
    hasta: formatDateForInput(today)
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showRequestForm, setShowRequestForm] = useState(false)
  const [quotationRequest, setQuotationRequest] = useState<PurchaseRequest | null>(null)
  const [reviewRequest, setReviewRequest] = useState<PurchaseRequest | null>(null)
  const [comparisonRequest, setComparisonRequest] = useState<PurchaseRequest | null>(null)
  const [comparisonCotizaciones, setComparisonCotizaciones] = useState<CotizacionGuardada[]>([])
  const [comparisonReadOnly, setComparisonReadOnly] = useState(false)
  const [approvalRequest, setApprovalRequest] = useState<PurchaseRequest | null>(null)
  const [approvalCotizaciones, setApprovalCotizaciones] = useState<CotizacionGuardada[]>([])
  const [approvalRecomendacion, setApprovalRecomendacion] = useState<RecomendacionCompra | null>(null)
  const [purchaseOrderRequest, setPurchaseOrderRequest] = useState<PurchaseRequest | null>(null)
  const [purchaseOrderRecomendacion, setPurchaseOrderRecomendacion] = useState<RecomendacionCompra | null>(null)

  // Generate requests based on active step
  const requests = useMemo(() => {
    return generateMockRequests(activeStep, stepperData[activeStep])
  }, [activeStep])

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          request.codigo.toLowerCase().includes(searchLower) ||
          request.dependencia.toLowerCase().includes(searchLower) ||
          request.usuario.toLowerCase().includes(searchLower) ||
          request.estado.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Centro de atención filter
      if (filters.centroAtencion && request.centroAtencion !== filters.centroAtencion) {
        return false
      }

      // Priority filter
      if (filters.prioridad && request.prioridad !== filters.prioridad) {
        return false
      }

      // Request type filter
      if (filters.tipoSolicitud && request.tipoSolicitud !== filters.tipoSolicitud) {
        return false
      }

      // Date filters
      if (filters.fechaDesde) {
        const desde = new Date(filters.fechaDesde)
        if (request.fechaCreacion < desde) return false
      }

      if (filters.fechaHasta) {
        const hasta = new Date(filters.fechaHasta)
        hasta.setHours(23, 59, 59, 999)
        if (request.fechaCreacion > hasta) return false
      }

      return true
    })
  }, [requests, filters])

  const handleStepClick = useCallback((step: RequestStatus) => {
    setActiveStep(step)
    setFilters({
      search: '',
      centroAtencion: '',
      prioridad: '',
      tipoSolicitud: '',
      fechaDesde: '',
      fechaHasta: ''
    })
  }, [])

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }, [])

  const handleCreateRequest = useCallback((data: unknown) => {
    console.log('Nueva solicitud creada:', data)
    // Aquí iría la lógica para enviar al backend
    setShowRequestForm(false)
  }, [])

  const handleCreateQuotation = useCallback((data: unknown) => {
    console.log('Nueva cotización creada:', data)
    // Aquí iría la lógica para enviar al backend
    setQuotationRequest(null)
  }, [])

  const handleReviewSubmit = useCallback((data: ReviewData) => {
    console.log('Revisión enviada:', data)
    // Aquí iría la lógica para enviar al backend
    setReviewRequest(null)
  }, [])

  const handleCompareQuotations = useCallback((request: PurchaseRequest) => {
    // Generar productos y cotizaciones mock para la comparación
    const productos = generateMockProducts(request.id)
    const cotizaciones = generateMockCotizaciones(request.id, productos)
    setComparisonCotizaciones(cotizaciones)
    setComparisonRequest(request)
  }, [])

  const handleApprovePurchase = useCallback((request: PurchaseRequest) => {
    // Generar datos mock para la aprobación
    const productos = generateMockProducts(request.id)
    const cotizaciones = generateMockCotizaciones(request.id, productos)
    const recomendacion = generateMockRecomendacion(request.id, cotizaciones)
    setApprovalCotizaciones(cotizaciones)
    setApprovalRecomendacion(recomendacion)
    setApprovalRequest(request)
  }, [])

  const handleApprovalSubmit = useCallback((data: PurchaseApprovalData) => {
    console.log('Aprobación/Rechazo enviado:', data)
    // Aquí iría la lógica para enviar al backend
    setApprovalRequest(null)
    setApprovalCotizaciones([])
    setApprovalRecomendacion(null)
  }, [])

  const handleCreatePurchaseOrder = useCallback((request: PurchaseRequest) => {
    // Generar datos mock para la orden de compra
    const productos = generateMockProducts(request.id)
    const cotizaciones = generateMockCotizaciones(request.id, productos)
    const recomendacion = generateMockRecomendacion(request.id, cotizaciones)
    setPurchaseOrderRecomendacion(recomendacion)
    setPurchaseOrderRequest(request)
  }, [])

  const handlePurchaseOrderSubmit = useCallback((data: OrdenCompra) => {
    console.log('Orden de compra creada:', data)
    // Aquí iría la lógica para enviar al backend
    setPurchaseOrderRequest(null)
    setPurchaseOrderRecomendacion(null)
  }, [])

const handleViewComparisonFromApproval = useCallback(() => {
  if (approvalRequest && approvalCotizaciones.length > 0) {
  setComparisonCotizaciones(approvalCotizaciones)
  setComparisonRequest(approvalRequest)
  setComparisonReadOnly(true)
  }
  }, [approvalRequest, approvalCotizaciones])

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    }).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-4 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground">
                    Solicitudes de Compra
                  </h1>
                  <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                    <PopoverTrigger asChild>
                      <button className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 cursor-pointer">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDisplayDate(dateRange.desde)} - {formatDisplayDate(dateRange.hasta)}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="start">
                      <div className="space-y-4">
                        <div className="text-sm font-medium text-foreground">Rango de consulta</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">Desde</label>
                            <Input
                              type="date"
                              value={dateRange.desde}
                              onChange={(e) => setDateRange(prev => ({ ...prev, desde: e.target.value }))}
                              className="w-full"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-xs text-muted-foreground">Hasta</label>
                            <Input
                              type="date"
                              value={dateRange.hasta}
                              onChange={(e) => setDateRange(prev => ({ ...prev, hasta: e.target.value }))}
                              className="w-full"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-border">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowDatePicker(false)}
                          >
                            Cancelar
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={() => {
                              setShowDatePicker(false)
                              handleRefresh()
                            }}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="ml-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span className="sr-only">Actualizar</span>
              </Button>

              <Button 
                onClick={() => setShowRequestForm(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Nueva Solicitud
              </Button>
            </div>

            <PriorityLegend />
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Workflow Stepper */}
        <section className="bg-card rounded-xl border border-border p-4 shadow-sm">
          <WorkflowStepper 
            activeStep={activeStep}
            onStepClick={handleStepClick}
            stepCounts={stepperData}
          />
        </section>

        {/* Filters */}
        <FilterPanel
          filters={filters}
          onFiltersChange={setFilters}
          totalItems={requests.length}
          filteredItems={filteredRequests.length}
        />

        {/* Table */}
        <RequestsTable 
          requests={filteredRequests}
          onViewProducts={setSelectedRequest}
          onAddQuotation={setQuotationRequest}
          onReviewRequest={setReviewRequest}
          onCompareQuotations={handleCompareQuotations}
          onApprovePurchase={handleApprovePurchase}
          onCreatePurchaseOrder={handleCreatePurchaseOrder}
        />
      </main>

{/* Request Detail Modal */}
      <RequestDetailModal
        request={selectedRequest}
        onClose={() => setSelectedRequest(null)}
      />

      {/* Request Form Modal */}
      <RequestFormModal
        isOpen={showRequestForm}
        onClose={() => setShowRequestForm(false)}
        onSubmit={handleCreateRequest}
      />

      {/* Quotation Modal */}
      <QuotationModal
        request={quotationRequest}
        onClose={() => setQuotationRequest(null)}
        onSubmit={handleCreateQuotation}
      />

      {/* Review Modal */}
      <ReviewModal
        request={reviewRequest}
        onClose={() => setReviewRequest(null)}
        onSubmit={handleReviewSubmit}
      />

      {/* Quotation Comparison Modal */}
      <QuotationComparisonModal
        request={comparisonRequest}
        cotizaciones={comparisonCotizaciones}
        readOnly={comparisonReadOnly}
        onClose={() => {
          setComparisonRequest(null)
          setComparisonCotizaciones([])
          setComparisonReadOnly(false)
        }}
      />

      {/* Purchase Approval Modal */}
      <PurchaseApprovalModal
        request={approvalRequest}
        cotizaciones={approvalCotizaciones}
        recomendacion={approvalRecomendacion}
        onClose={() => {
          setApprovalRequest(null)
          setApprovalCotizaciones([])
          setApprovalRecomendacion(null)
        }}
        onSubmit={handleApprovalSubmit}
        onViewComparison={handleViewComparisonFromApproval}
      />

      {/* Purchase Order Modal */}
      <PurchaseOrderModal
        request={purchaseOrderRequest}
        recomendacion={purchaseOrderRecomendacion}
        onClose={() => {
          setPurchaseOrderRequest(null)
          setPurchaseOrderRecomendacion(null)
        }}
        onSubmit={handlePurchaseOrderSubmit}
      />
    </div>
  )
}
