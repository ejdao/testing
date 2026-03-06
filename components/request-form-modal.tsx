'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  FileText, 
  Upload, 
  Package, 
  AlertCircle,
  Edit2,
  Check,
  ChevronDown,
  Search,
  AlertTriangle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { centrosAtencion, dependencias, catalogoProductos } from '@/lib/mock-data'
import type { Priority, RequestType, ItemType, RequestItem } from '@/lib/types'

interface RequestFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: FormData) => void
}

interface FormData {
  centroAtencion: string
  tipo: RequestType | ''
  prioridad: Priority | ''
  dependencia: string
  justificacion: string
  items: RequestItem[]
}

const initialFormData: FormData = {
  centroAtencion: '',
  tipo: '',
  prioridad: '',
  dependencia: '',
  justificacion: '',
  items: []
}

const initialItem: Omit<RequestItem, 'id'> = {
  nombreItem: '',
  esNuevoProducto: false,
  fichaTecnica: null,
  tipoItem: '',
  cantidad: 1,
  marca: '',
  descripcion: ''
}

const MAX_CHARS = 1000

export function RequestFormModal({ isOpen, onClose, onSubmit }: RequestFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [currentItem, setCurrentItem] = useState<Omit<RequestItem, 'id'>>(initialItem)
  const [editingItemId, setEditingItemId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [itemErrors, setItemErrors] = useState<Record<string, string>>({})
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredProducts, setFilteredProducts] = useState<typeof catalogoProductos>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!isOpen) return null

  const handleFormChange = (field: keyof FormData, value: string) => {
    // Limit justificacion to MAX_CHARS
    if (field === 'justificacion' && value.length > MAX_CHARS) {
      return
    }
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleItemChange = (field: keyof Omit<RequestItem, 'id'>, value: string | number | File | null | boolean) => {
    // Limit descripcion to MAX_CHARS
    if (field === 'descripcion' && typeof value === 'string' && value.length > MAX_CHARS) {
      return
    }
    setCurrentItem(prev => ({ ...prev, [field]: value }))
    if (itemErrors[field]) {
      setItemErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const handleItemNameChange = (value: string) => {
    handleItemChange('nombreItem', value)
    
    if (formData.tipo === 'PRODUCTOS' && value.length >= 2) {
      const filtered = catalogoProductos.filter(p => 
        p.nombre.toLowerCase().includes(value.toLowerCase()) ||
        p.codigo.toLowerCase().includes(value.toLowerCase())
      )
      setFilteredProducts(filtered)
      setShowSuggestions(true)
      
      // Check if exact match exists
      const exactMatch = catalogoProductos.some(p => 
        p.nombre.toLowerCase() === value.toLowerCase()
      )
      handleItemChange('esNuevoProducto', !exactMatch && value.length > 0)
    } else {
      setShowSuggestions(false)
      handleItemChange('esNuevoProducto', false)
    }
  }

  const selectProduct = (producto: typeof catalogoProductos[0]) => {
    handleItemChange('nombreItem', producto.nombre)
    handleItemChange('esNuevoProducto', false)
    setShowSuggestions(false)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        setItemErrors(prev => ({ ...prev, fichaTecnica: 'Solo se permiten archivos PDF' }))
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setItemErrors(prev => ({ ...prev, fichaTecnica: 'El archivo no debe superar 5MB' }))
        return
      }
      handleItemChange('fichaTecnica', file)
    }
  }

  const validateItem = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!currentItem.nombreItem.trim()) {
      newErrors.nombreItem = 'El nombre del ítem es requerido'
    }
    
    if (!currentItem.fichaTecnica) {
      newErrors.fichaTecnica = 'La ficha técnica es requerida'
    }
    
    if (formData.tipo === 'PRODUCTOS' && !currentItem.tipoItem) {
      newErrors.tipoItem = 'El tipo de ítem es requerido'
    }
    
    if (!currentItem.cantidad || currentItem.cantidad < 1) {
      newErrors.cantidad = 'La cantidad debe ser al menos 1'
    }

    setItemErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addItem = () => {
    if (!validateItem()) return

    const newItem: RequestItem = {
      id: `item-${Date.now()}`,
      ...currentItem
    }

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))

    setCurrentItem(initialItem)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updateItem = () => {
    if (!validateItem() || !editingItemId) return

    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === editingItemId 
          ? { ...currentItem, id: editingItemId }
          : item
      )
    }))

    setCurrentItem(initialItem)
    setEditingItemId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const editItem = (item: RequestItem) => {
    setCurrentItem({
      nombreItem: item.nombreItem,
      esNuevoProducto: item.esNuevoProducto,
      fichaTecnica: item.fichaTecnica,
      tipoItem: item.tipoItem,
      cantidad: item.cantidad,
      marca: item.marca,
      descripcion: item.descripcion
    })
    setEditingItemId(item.id)
  }

  const cancelEdit = () => {
    setCurrentItem(initialItem)
    setEditingItemId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.centroAtencion) newErrors.centroAtencion = 'Seleccione un centro de atención'
    if (!formData.tipo) newErrors.tipo = 'Seleccione un tipo de solicitud'
    if (!formData.prioridad) newErrors.prioridad = 'Seleccione una prioridad'
    if (!formData.dependencia) newErrors.dependencia = 'Seleccione una dependencia'
    if (!formData.justificacion.trim()) newErrors.justificacion = 'Ingrese la justificación'
    if (formData.items.length === 0) newErrors.items = 'Agregue al menos un ítem'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return
    onSubmit(formData)
    setFormData(initialFormData)
    setCurrentItem(initialItem)
    onClose()
  }

  const handleClose = () => {
    setFormData(initialFormData)
    setCurrentItem(initialItem)
    setErrors({})
    setItemErrors({})
    setEditingItemId(null)
    onClose()
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-border"
        role="dialog"
        aria-labelledby="form-title"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h2 id="form-title" className="text-lg font-semibold text-foreground">
                Nueva Solicitud de Compra
              </h2>
              <p className="text-sm text-muted-foreground">
                Complete los datos de la solicitud
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
            <X className="h-4 w-4" />
            <span className="sr-only">Cerrar</span>
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <div className="space-y-6">
            {/* Datos generales */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
                Datos de la Solicitud
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Centro de atención */}
                <div className="space-y-1.5">
                  <Label htmlFor="centroAtencion" className="text-sm font-medium">
                    Centro de Atención <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="centroAtencion"
                      value={formData.centroAtencion}
                      onChange={(e) => handleFormChange('centroAtencion', e.target.value)}
                      className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        errors.centroAtencion ? 'border-destructive' : 'border-input'
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      {centrosAtencion.map(centro => (
                        <option key={centro} value={centro}>{centro}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.centroAtencion && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.centroAtencion}
                    </p>
                  )}
                </div>

                {/* Tipo */}
                <div className="space-y-1.5">
                  <Label htmlFor="tipo" className="text-sm font-medium">
                    Tipo de Solicitud <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="tipo"
                      value={formData.tipo}
                      onChange={(e) => {
                        handleFormChange('tipo', e.target.value)
                        // Reset item fields when changing request type
                        setCurrentItem(prev => ({ ...prev, tipoItem: '', nombreItem: '', esNuevoProducto: false }))
                      }}
                      className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        errors.tipo ? 'border-destructive' : 'border-input'
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="PRODUCTOS">Productos</option>
                      <option value="SERVICIOS">Servicios</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.tipo && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.tipo}
                    </p>
                  )}
                </div>

                {/* Prioridad */}
                <div className="space-y-1.5">
                  <Label htmlFor="prioridad" className="text-sm font-medium">
                    Prioridad <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="prioridad"
                      value={formData.prioridad}
                      onChange={(e) => handleFormChange('prioridad', e.target.value)}
                      className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        errors.prioridad ? 'border-destructive' : 'border-input'
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="BAJA">Baja</option>
                      <option value="MEDIA">Media</option>
                      <option value="ALTA">Alta</option>
                      <option value="CRITICA">Crítica</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.prioridad && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.prioridad}
                    </p>
                  )}
                </div>

                {/* Dependencia */}
                <div className="space-y-1.5">
                  <Label htmlFor="dependencia" className="text-sm font-medium">
                    Dependencia <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative">
                    <select
                      id="dependencia"
                      value={formData.dependencia}
                      onChange={(e) => handleFormChange('dependencia', e.target.value)}
                      className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        errors.dependencia ? 'border-destructive' : 'border-input'
                      }`}
                    >
                      <option value="">Seleccionar...</option>
                      {dependencias.map(dep => (
                        <option key={dep} value={dep}>{dep}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                  {errors.dependencia && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.dependencia}
                    </p>
                  )}
                </div>
              </div>

              {/* Justificación */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="justificacion" className="text-sm font-medium">
                    Justificación <span className="text-destructive">*</span>
                  </Label>
                  <span className={`text-xs ${formData.justificacion.length >= MAX_CHARS ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {formData.justificacion.length}/{MAX_CHARS}
                  </span>
                </div>
                <Textarea
                  id="justificacion"
                  value={formData.justificacion}
                  onChange={(e) => handleFormChange('justificacion', e.target.value)}
                  placeholder="Describa la justificación de esta solicitud..."
                  rows={3}
                  className={errors.justificacion ? 'border-destructive' : ''}
                />
                {errors.justificacion && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.justificacion}
                  </p>
                )}
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                  Ítems de la Solicitud
                </h3>
                {errors.items && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.items}
                  </p>
                )}
              </div>

              {/* Mensaje si no hay tipo seleccionado */}
              {!formData.tipo && (
                <div className="bg-muted/50 rounded-lg p-4 text-center text-sm text-muted-foreground border border-dashed border-border">
                  Seleccione el tipo de solicitud para agregar ítems
                </div>
              )}

              {/* Item Form */}
              {formData.tipo && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-4 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {editingItemId ? 'Editar ítem' : 'Agregar nuevo ítem'}
                    </span>
                    {editingItemId && (
                      <Button variant="ghost" size="sm" onClick={cancelEdit}>
                        Cancelar edición
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Nombre del ítem con autocompletado */}
                    <div className="space-y-1.5 md:col-span-2" ref={suggestionsRef}>
                      <Label htmlFor="nombreItem" className="text-sm font-medium">
                        {formData.tipo === 'PRODUCTOS' ? 'Producto' : 'Servicio'} <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="text"
                          id="nombreItem"
                          value={currentItem.nombreItem}
                          onChange={(e) => handleItemNameChange(e.target.value)}
                          onFocus={() => {
                            if (formData.tipo === 'PRODUCTOS' && currentItem.nombreItem.length >= 2) {
                              setShowSuggestions(true)
                            }
                          }}
                          placeholder={formData.tipo === 'PRODUCTOS' 
                            ? "Buscar producto por nombre o código..." 
                            : "Describa el servicio requerido..."
                          }
                          className={`pl-10 ${itemErrors.nombreItem ? 'border-destructive' : ''}`}
                        />
                        
                        {/* Autocomplete suggestions for products */}
                        {showSuggestions && formData.tipo === 'PRODUCTOS' && filteredProducts.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-auto">
                            {filteredProducts.map((producto) => (
                              <button
                                key={producto.id}
                                type="button"
                                onClick={() => selectProduct(producto)}
                                className="w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center justify-between"
                              >
                                <div>
                                  <span className="text-sm font-medium text-foreground">{producto.nombre}</span>
                                  <span className="text-xs text-muted-foreground ml-2">({producto.codigo})</span>
                                </div>
                                <span className="text-xs text-muted-foreground">{producto.categoria}</span>
                              </button>
                            ))}
                          </div>
                        )}
                        
                        {/* No results message */}
                        {showSuggestions && formData.tipo === 'PRODUCTOS' && filteredProducts.length === 0 && currentItem.nombreItem.length >= 2 && (
                          <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg">
                            <div className="px-4 py-3 text-sm text-muted-foreground">
                              No se encontraron productos
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* New product warning */}
                      {formData.tipo === 'PRODUCTOS' && currentItem.esNuevoProducto && currentItem.nombreItem.length >= 2 && (
                        <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                          <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-xs text-amber-800">
                            <span className="font-medium">Producto nuevo:</span> Este producto no existe en el catálogo. 
                            El encargado deberá agregarlo a la base de datos durante el proceso de la solicitud.
                          </div>
                        </div>
                      )}
                      
                      {itemErrors.nombreItem && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {itemErrors.nombreItem}
                        </p>
                      )}
                    </div>

                    {/* Tipo de ítem - Solo para productos */}
                    {formData.tipo === 'PRODUCTOS' && (
                      <div className="space-y-1.5">
                        <Label htmlFor="tipoItem" className="text-sm font-medium">
                          Tipo de Ítem <span className="text-destructive">*</span>
                        </Label>
                        <div className="relative">
                          <select
                            id="tipoItem"
                            value={currentItem.tipoItem}
                            onChange={(e) => handleItemChange('tipoItem', e.target.value as ItemType)}
                            className={`w-full h-10 rounded-md border bg-background px-3 py-2 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                              itemErrors.tipoItem ? 'border-destructive' : 'border-input'
                            }`}
                          >
                            <option value="">Seleccionar...</option>
                            <option value="PRODUCTO">Producto</option>
                            <option value="ACTIVO_FIJO">Activo Fijo</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        </div>
                        {itemErrors.tipoItem && (
                          <p className="text-xs text-destructive flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {itemErrors.tipoItem}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Ficha técnica */}
                    <div className="space-y-1.5">
                      <Label htmlFor="fichaTecnica" className="text-sm font-medium">
                        Ficha Técnica (PDF) <span className="text-destructive">*</span>
                      </Label>
                      <div className="relative">
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="fichaTecnica"
                          accept=".pdf"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            itemErrors.fichaTecnica ? 'border-destructive' : ''
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {currentItem.fichaTecnica 
                            ? <span className="truncate">{currentItem.fichaTecnica.name}</span>
                            : 'Seleccionar archivo'
                          }
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Máximo 5MB</p>
                      {itemErrors.fichaTecnica && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {itemErrors.fichaTecnica}
                        </p>
                      )}
                    </div>

                    {/* Cantidad */}
                    <div className="space-y-1.5">
                      <Label htmlFor="cantidad" className="text-sm font-medium">
                        Cantidad <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        type="number"
                        id="cantidad"
                        min="1"
                        value={currentItem.cantidad}
                        onChange={(e) => handleItemChange('cantidad', parseInt(e.target.value) || 0)}
                        className={itemErrors.cantidad ? 'border-destructive' : ''}
                      />
                      {itemErrors.cantidad && (
                        <p className="text-xs text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {itemErrors.cantidad}
                        </p>
                      )}
                    </div>

                    {/* Marca */}
                    <div className="space-y-1.5">
                      <Label htmlFor="marca" className="text-sm font-medium">
                        Marca <span className="text-muted-foreground text-xs">(opcional)</span>
                      </Label>
                      <Input
                        type="text"
                        id="marca"
                        value={currentItem.marca}
                        onChange={(e) => handleItemChange('marca', e.target.value)}
                        placeholder="Ej: Samsung, HP, etc."
                      />
                    </div>

                    {/* Descripción/Observaciones */}
                    <div className="space-y-1.5 md:col-span-2 lg:col-span-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="descripcionItem" className="text-sm font-medium">
                          Observaciones <span className="text-muted-foreground text-xs">(opcional)</span>
                        </Label>
                        <span className={`text-xs ${currentItem.descripcion.length >= MAX_CHARS ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {currentItem.descripcion.length}/{MAX_CHARS}
                        </span>
                      </div>
                      <Textarea
                        id="descripcionItem"
                        value={currentItem.descripcion}
                        onChange={(e) => handleItemChange('descripcion', e.target.value)}
                        placeholder="Observaciones adicionales del ítem..."
                        rows={2}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      type="button" 
                      onClick={editingItemId ? updateItem : addItem}
                      className="gap-2"
                    >
                      {editingItemId ? (
                        <>
                          <Check className="h-4 w-4" />
                          Actualizar Ítem
                        </>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          Agregar Ítem
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Items List */}
              {formData.items.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm font-medium text-foreground">
                    Ítems agregados ({formData.items.length})
                  </div>
                  <div className="space-y-2">
                    {formData.items.map((item, index) => (
                      <div 
                        key={item.id}
                        className="flex items-center justify-between bg-background rounded-lg border border-border p-3 hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-medium flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Package className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium text-foreground truncate">
                                {item.nombreItem || 'Sin nombre'}
                              </span>
                              {item.esNuevoProducto && (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Nuevo
                                </span>
                              )}
                              {item.tipoItem && (
                                <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded-full">
                                  {item.tipoItem === 'PRODUCTO' ? 'Producto' : 'Activo Fijo'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground flex-wrap">
                              <span>Cantidad: {item.cantidad}</span>
                              {item.marca && <span>Marca: {item.marca}</span>}
                              {item.fichaTecnica && (
                                <span className="flex items-center gap-1">
                                  <FileText className="h-3 w-3" />
                                  {item.fichaTecnica.name}
                                </span>
                              )}
                            </div>
                            {item.descripcion && (
                              <p className="text-xs text-muted-foreground mt-1 truncate max-w-md">
                                {item.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => editItem(item)}
                          >
                            <Edit2 className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => removeItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Eliminar</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-border bg-muted/50">
          <div className="text-sm text-muted-foreground">
            <span className="text-destructive">*</span> Campos requeridos
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              <FileText className="h-4 w-4" />
              Crear Solicitud
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
