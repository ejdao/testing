'use client'

import { X, Package, Hash, Scale, FileText, History, User, Calendar, Building2, AlertCircle, ChevronRight, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import type { PurchaseRequest, Product, CambioEstado } from '@/lib/types'
import { generateMockProducts, generateMockHistorialEstados } from '@/lib/mock-data'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface RequestDetailModalProps {
  request: PurchaseRequest | null
  onClose: () => void
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
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date)
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date)
}

function getPriorityConfig(priority: string) {
  switch (priority) {
    case 'CRITICA':
      return { color: 'bg-red-100 text-red-800 border-red-200', label: 'Critica' }
    case 'ALTA':
      return { color: 'bg-orange-100 text-orange-800 border-orange-200', label: 'Alta' }
    case 'MEDIA':
      return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Media' }
    case 'BAJA':
      return { color: 'bg-green-100 text-green-800 border-green-200', label: 'Baja' }
    default:
      return { color: 'bg-gray-100 text-gray-800 border-gray-200', label: priority }
  }
}

export function RequestDetailModal({ request, onClose }: RequestDetailModalProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [historial, setHistorial] = useState<CambioEstado[]>([])
  const [activeTab, setActiveTab] = useState('info')

  useEffect(() => {
    if (request) {
      setProducts(generateMockProducts(request.id))
      setHistorial(generateMockHistorialEstados(request.id, request.estado))
    }
  }, [request])

  if (!request) return null

  const total = products.reduce((sum, p) => sum + (p.cantidad * p.precioEstimado), 0)
  const prioridadConfig = getPriorityConfig(request.prioridad)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-border bg-muted/50">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h2 id="modal-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Detalle de Solicitud
                </h2>
                <span className="font-mono text-primary font-bold">{request.codigo}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <Badge variant="outline" className={cn('text-xs', prioridadConfig.color)}>
                  {prioridadConfig.label}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {request.tipoSolicitud}
                </Badge>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  {request.estado}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 flex-shrink-0">
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <div className="flex-shrink-0 px-6 border-b border-border bg-background">
            <TabsList className="h-12 bg-transparent p-0 gap-4">
              <TabsTrigger 
                value="info" 
                className="relative h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-3"
              >
                <FileText className="h-4 w-4 mr-2" />
                Informacion General
              </TabsTrigger>
              <TabsTrigger 
                value="products" 
                className="relative h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-3"
              >
                <Package className="h-4 w-4 mr-2" />
                Productos ({products.length})
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="relative h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 pt-3"
              >
                <History className="h-4 w-4 mr-2" />
                Seguimiento ({historial.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Info Tab */}
            <TabsContent value="info" className="m-0 p-6 h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informacion basica */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Informacion de la Solicitud
                  </h3>
                  <div className="bg-background rounded-lg border border-border p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Dependencia</p>
                        <p className="text-sm font-medium text-foreground">{request.dependencia}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Centro de Atencion</p>
                        <p className="text-sm font-medium text-foreground">{request.centroAtencion}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Solicitante</p>
                        <p className="text-sm font-medium text-foreground">{request.usuario}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fechas y montos */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Fechas y Montos
                  </h3>
                  <div className="bg-background rounded-lg border border-border p-4 space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Fecha de Creacion</p>
                        <p className="text-sm font-medium text-foreground">{formatDate(request.fechaCreacion)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Ultimo Cambio de Estado</p>
                        <p className="text-sm font-medium text-foreground">{formatDate(request.ultimoCambioEstado)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-xs text-muted-foreground">Total Estimado</p>
                        <p className="text-lg font-mono font-bold text-primary">{formatCurrency(total)}</p>
                      </div>
                    </div>
                    {request.totalFacturado > 0 && (
                      <div className="flex items-start gap-3">
                        <Hash className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground">Total Facturado</p>
                          <p className="text-lg font-mono font-bold text-foreground">{formatCurrency(request.totalFacturado)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Justificacion */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Justificacion
                  </h3>
                  <div className="bg-background rounded-lg border border-border p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">{request.justificacion}</p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Products Tab */}
            <TabsContent value="products" className="m-0 p-6 h-full">
              <div className="space-y-3">
                {products.map((product, index) => (
                  <div 
                    key={product.id}
                    className="bg-background rounded-lg border border-border p-4 hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {index + 1}
                          </span>
                          <h3 className="font-medium text-foreground truncate">
                            {product.nombre}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 ml-8">
                          {product.descripcion}
                        </p>
                        <div className="flex items-center gap-4 mt-2 ml-8">
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Hash className="h-3.5 w-3.5" />
                            <span><span className="font-medium text-foreground">{product.cantidad}</span> unidades</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Scale className="h-3.5 w-3.5" />
                            <span>{product.unidad}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Precio unit.</p>
                        <p className="font-mono text-sm font-medium text-foreground">
                          {formatCurrency(product.precioEstimado)}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">Subtotal</p>
                        <p className="font-mono text-sm font-semibold text-primary">
                          {formatCurrency(product.cantidad * product.precioEstimado)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-border flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Total de productos: <span className="font-medium text-foreground">{products.length}</span>
                </p>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Estimado</p>
                  <p className="font-mono text-xl font-bold text-foreground">
                    {formatCurrency(total)}
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="m-0 p-6 h-full">
              <div className="space-y-1">
                {historial.map((cambio, index) => (
                  <div 
                    key={cambio.id}
                    className="relative pl-8 pb-6 last:pb-0"
                  >
                    {/* Timeline line */}
                    {index < historial.length - 1 && (
                      <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border" />
                    )}
                    
                    {/* Timeline dot */}
                    <div className={cn(
                      "absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center",
                      index === historial.length - 1 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted border-2 border-border"
                    )}>
                      {index === historial.length - 1 ? (
                        <Clock className="h-3 w-3" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="bg-background rounded-lg border border-border p-4">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className="text-xs bg-muted">
                              {cambio.estadoAnterior}
                            </Badge>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                            <Badge variant="outline" className={cn(
                              "text-xs",
                              index === historial.length - 1 
                                ? "bg-primary/10 text-primary border-primary/30" 
                                : "bg-muted"
                            )}>
                              {cambio.estadoNuevo}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-2">
                            {cambio.observaciones}
                          </p>
                        </div>
                        <div className="text-right text-sm space-y-1">
                          <p className="text-xs text-muted-foreground">
                            {formatDateShort(cambio.fecha)}
                          </p>
                          <p className="font-medium text-foreground">
                            {cambio.usuarioNombre}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            CC: {cambio.usuarioDocumento}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-end px-6 py-4 border-t border-border bg-muted/50">
          <Button onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
