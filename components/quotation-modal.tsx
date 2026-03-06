'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { X, Upload, FileText, Search, AlertCircle, Building2, Check, Percent, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { catalogoProveedores, preciosHistoricos, generateMockProducts } from '@/lib/mock-data'
import type { PurchaseRequest, Product, ProductoCotizacion } from '@/lib/types'

interface QuotationModalProps {
  request: PurchaseRequest | null
  onClose: () => void
  onSubmit: (data: unknown) => void
}

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
]

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

export function QuotationModal({ request, onClose, onSubmit }: QuotationModalProps) {
  // Proveedor state
  const [proveedorSearch, setProveedorSearch] = useState('')
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<string | null>(null)
  const [proveedorNombre, setProveedorNombre] = useState('')
  const [esNuevoProveedor, setEsNuevoProveedor] = useState(false)
  const [showProveedorSuggestions, setShowProveedorSuggestions] = useState(false)
  const proveedorInputRef = useRef<HTMLInputElement>(null)

  // General state
  const [esUltimaCotizacion, setEsUltimaCotizacion] = useState(false)
  const [comprobante, setComprobante] = useState<File | null>(null)
  const [comprobanteError, setComprobanteError] = useState('')

  // Products for quotation
  const [productos, setProductos] = useState<Product[]>([])
  const [cotizacionProductos, setCotizacionProductos] = useState<ProductoCotizacion[]>([])

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  // Load products when request changes
  useEffect(() => {
    if (request) {
      const mockProducts = generateMockProducts(request.id)
      setProductos(mockProducts)
      
      // Initialize quotation products
      setCotizacionProductos(mockProducts.map(p => ({
        productoId: p.id,
        nombre: p.nombre,
        cantidad: p.cantidad,
        precioAnterior: preciosHistoricos[p.nombre],
        precio: preciosHistoricos[p.nombre] || 0,
        descuento: 0,
        total: (preciosHistoricos[p.nombre] || 0) * p.cantidad,
        incluyeIva: false
      })))
    }
  }, [request])

  // Filter proveedores
  const proveedoresFiltrados = useMemo(() => {
    if (!proveedorSearch.trim()) return []
    const search = proveedorSearch.toLowerCase()
    return catalogoProveedores.filter(p => 
      p.nombre.toLowerCase().includes(search) ||
      p.nit.includes(search)
    ).slice(0, 8)
  }, [proveedorSearch])

  // Check if proveedor is new
  useEffect(() => {
    if (proveedorSearch.trim() && proveedoresFiltrados.length === 0 && !proveedorSeleccionado) {
      setEsNuevoProveedor(true)
      setProveedorNombre(proveedorSearch)
    } else if (proveedorSeleccionado) {
      setEsNuevoProveedor(false)
    }
  }, [proveedorSearch, proveedoresFiltrados, proveedorSeleccionado])

  const handleSelectProveedor = (proveedor: typeof catalogoProveedores[0]) => {
    setProveedorSeleccionado(proveedor.id)
    setProveedorNombre(proveedor.nombre)
    setProveedorSearch(proveedor.nombre)
    setEsNuevoProveedor(false)
    setShowProveedorSuggestions(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setComprobanteError('')

    if (!file) {
      setComprobante(null)
      return
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setComprobanteError('Tipo de archivo no permitido. Use PDF, imagen, Word o Excel.')
      setComprobante(null)
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setComprobanteError('El archivo no debe superar 5MB')
      setComprobante(null)
      return
    }

    setComprobante(file)
  }

  const updateProductoCotizacion = (productoId: string, field: keyof ProductoCotizacion, value: number | boolean) => {
    setCotizacionProductos(prev => prev.map(p => {
      if (p.productoId !== productoId) return p
      
      const updated = { ...p, [field]: value }
      
      // Recalculate total
      if (field === 'precio' || field === 'descuento') {
        const precio = field === 'precio' ? (value as number) : p.precio
        const descuento = field === 'descuento' ? (value as number) : p.descuento
        const descuentoMonto = precio * (descuento / 100)
        updated.total = (precio - descuentoMonto) * p.cantidad
      }
      
      return updated
    }))
  }

  const calculateTotalCotizacion = () => {
    return cotizacionProductos.reduce((sum, p) => sum + p.total, 0)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!proveedorSearch.trim()) {
      newErrors.proveedor = 'Debe seleccionar o ingresar un proveedor'
    }

    if (!comprobante) {
      newErrors.comprobante = 'Debe adjuntar un comprobante'
    }

    // Validate products
    cotizacionProductos.forEach((p, index) => {
      if (p.precio <= 0) {
        newErrors[`precio_${index}`] = 'El precio debe ser mayor a 0'
      }
      if (p.descuento < 0 || p.descuento > 100) {
        newErrors[`descuento_${index}`] = 'El descuento debe estar entre 0 y 100'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    setTouched({
      proveedor: true,
      comprobante: true,
      ...cotizacionProductos.reduce((acc, _, i) => ({
        ...acc,
        [`precio_${i}`]: true,
        [`descuento_${i}`]: true
      }), {})
    })

    if (!validateForm()) return

    const data = {
      proveedorId: proveedorSeleccionado,
      proveedorNombre,
      esNuevoProveedor,
      esUltimaCotizacion,
      comprobante,
      productos: cotizacionProductos,
      totalCotizacion: calculateTotalCotizacion(),
      solicitudId: request?.id
    }

    onSubmit(data)
    onClose()
  }

  if (!request) return null

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border"
        role="dialog"
        aria-labelledby="quotation-modal-title"
        aria-modal="true"
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
          <div>
            <h2 id="quotation-modal-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Agregar Cotización
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Solicitud <span className="font-mono font-medium">{request.codigo}</span> · {request.dependencia}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="space-y-6">
            {/* Proveedor Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                Información del Proveedor
              </h3>
              
              <div className="relative">
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Proveedor <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={proveedorInputRef}
                    type="text"
                    placeholder="Buscar proveedor por nombre o NIT..."
                    value={proveedorSearch}
                    onChange={(e) => {
                      setProveedorSearch(e.target.value)
                      setProveedorSeleccionado(null)
                      setShowProveedorSuggestions(true)
                    }}
                    onFocus={() => setShowProveedorSuggestions(true)}
                    onBlur={() => {
                      setTouched(prev => ({ ...prev, proveedor: true }))
                      setTimeout(() => setShowProveedorSuggestions(false), 200)
                    }}
                    className={cn(
                      "pl-10",
                      errors.proveedor && touched.proveedor && "border-destructive"
                    )}
                  />
                </div>
                
                {/* Suggestions dropdown */}
                {showProveedorSuggestions && proveedoresFiltrados.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {proveedoresFiltrados.map((proveedor) => (
                      <button
                        key={proveedor.id}
                        type="button"
                        onClick={() => handleSelectProveedor(proveedor)}
                        className="w-full px-4 py-3 text-left hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{proveedor.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              NIT: {proveedor.nit} · {proveedor.contacto}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* New proveedor alert */}
                {esNuevoProveedor && proveedorSearch.trim() && (
                  <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-amber-800">Nuevo proveedor</p>
                      <p className="text-amber-700">
                        Este proveedor no está registrado. Durante el proceso de aprobación, el encargado deberá agregarlo a la base de datos.
                      </p>
                    </div>
                  </div>
                )}

                {errors.proveedor && touched.proveedor && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.proveedor}
                  </p>
                )}
              </div>

              {/* Es última cotización */}
              <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                <Checkbox
                  id="ultima-cotizacion"
                  checked={esUltimaCotizacion}
                  onCheckedChange={(checked) => setEsUltimaCotizacion(checked === true)}
                />
                <label htmlFor="ultima-cotizacion" className="text-sm text-foreground cursor-pointer">
                  Esta es la última cotización para esta solicitud
                </label>
              </div>

              {/* Comprobante */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Comprobante de Cotización <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="comprobante-input"
                  />
                  <label
                    htmlFor="comprobante-input"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                      comprobante 
                        ? "border-primary/50 bg-primary/5" 
                        : "border-border hover:border-primary/30 hover:bg-muted/50",
                      comprobanteError && "border-destructive"
                    )}
                  >
                    {comprobante ? (
                      <>
                        <FileText className="h-5 w-5 text-primary" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{comprobante.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(comprobante.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            setComprobante(null)
                          }}
                        >
                          Cambiar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-foreground">Haga clic para subir el comprobante</p>
                          <p className="text-xs text-muted-foreground">PDF, imagen, Word o Excel (máx. 5MB)</p>
                        </div>
                      </>
                    )}
                  </label>
                </div>
                {comprobanteError && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {comprobanteError}
                  </p>
                )}
                {errors.comprobante && touched.comprobante && !comprobante && (
                  <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.comprobante}
                  </p>
                )}
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">
                Precios por Producto
              </h3>

              <div className="space-y-4">
                {cotizacionProductos.map((producto, index) => {
                  const productoOriginal = productos.find(p => p.id === producto.productoId)
                  
                  return (
                    <div key={producto.productoId} className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {index + 1}
                          </span>
                          <div>
                            <h4 className="font-medium text-foreground">{producto.nombre}</h4>
                            <p className="text-xs text-muted-foreground">
                              Cantidad solicitada: {producto.cantidad} {productoOriginal?.unidad || 'unidades'}
                            </p>
                          </div>
                        </div>
                        {producto.precioAnterior && (
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Precio anterior</p>
                            <p className="text-sm font-mono text-foreground">{formatCurrency(producto.precioAnterior)}</p>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        {/* Precio */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Precio Unitario <span className="text-destructive">*</span>
                          </label>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="number"
                              min={0}
                              value={producto.precio || ''}
                              onChange={(e) => updateProductoCotizacion(producto.productoId, 'precio', Number(e.target.value))}
                              onBlur={() => setTouched(prev => ({ ...prev, [`precio_${index}`]: true }))}
                              placeholder={producto.precioAnterior ? `Sugerido: ${producto.precioAnterior}` : '0'}
                              className={cn(
                                "pl-10",
                                errors[`precio_${index}`] && touched[`precio_${index}`] && "border-destructive"
                              )}
                            />
                          </div>
                        </div>

                        {/* Descuento */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Descuento (%)
                          </label>
                          <div className="relative">
                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={producto.descuento || ''}
                              onChange={(e) => updateProductoCotizacion(producto.productoId, 'descuento', Number(e.target.value))}
                              onBlur={() => setTouched(prev => ({ ...prev, [`descuento_${index}`]: true }))}
                              placeholder="0"
                              className={cn(
                                "pl-10",
                                errors[`descuento_${index}`] && touched[`descuento_${index}`] && "border-destructive"
                              )}
                            />
                          </div>
                        </div>

                        {/* Total */}
                        <div>
                          <label className="block text-xs font-medium text-muted-foreground mb-1">
                            Total a Pagar
                          </label>
                          <div className="h-9 px-3 flex items-center bg-background border border-border rounded-md">
                            <span className="font-mono text-sm font-medium text-primary">
                              {formatCurrency(producto.total)}
                            </span>
                          </div>
                        </div>

                        {/* Incluye IVA */}
                        <div className="flex items-end pb-1.5">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`iva-${producto.productoId}`}
                              checked={producto.incluyeIva}
                              onCheckedChange={(checked) => updateProductoCotizacion(producto.productoId, 'incluyeIva', checked === true)}
                            />
                            <label htmlFor={`iva-${producto.productoId}`} className="text-sm text-foreground cursor-pointer">
                              Incluye IVA
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-border bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">
              Total cotización: <span className="font-mono font-semibold text-lg text-foreground">{formatCurrency(calculateTotalCotizacion())}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Check className="h-4 w-4" />
              Guardar Cotización
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
