'use client'

import { X, Package, Hash, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PurchaseRequest, Product } from '@/lib/types'
import { generateMockProducts } from '@/lib/mock-data'
import { useEffect, useState } from 'react'

interface ProductsModalProps {
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

export function ProductsModal({ request, onClose }: ProductsModalProps) {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    if (request) {
      setProducts(generateMockProducts(request.id))
    }
  }, [request])

  if (!request) return null

  const total = products.reduce((sum, p) => sum + (p.cantidad * p.precioEstimado), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/50 backdrop-blur-sm">
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col border border-border"
        role="dialog"
        aria-labelledby="modal-title"
        aria-modal="true"
      >
        {/* Header - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-border bg-muted/50">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Productos Solicitados
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
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-border bg-muted/50">
          <div>
            <p className="text-sm text-muted-foreground">
              Total de productos: <span className="font-medium text-foreground">{products.length}</span>
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Estimado</p>
              <p className="font-mono text-xl font-bold text-foreground">
                {formatCurrency(total)}
              </p>
            </div>
            <Button onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
