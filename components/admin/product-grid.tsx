'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Plus, Trash2, LayoutGrid, Columns2, Image as ImageIcon, Pencil, Upload, RotateCcw, Check } from 'lucide-react'
import { AddProductModal } from './add-product-modal'
import { EditProductModal } from './edit-product-modal'
import type { Product, LayoutType } from '@/lib/types'

const layoutIcons: Record<LayoutType, React.ReactNode> = {
  large: <LayoutGrid size={14} />,
  double: <Columns2 size={14} />,
  gallery: <ImageIcon size={14} />
}

const layoutLabels: Record<LayoutType, string> = {
  large: '大图',
  double: '双列',
  gallery: '画廊'
}

export function ProductGrid() {
  const { draftSeries, selectedSeriesId, deleteProduct, isDirty, publish, discardChanges } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showPublishSuccess, setShowPublishSuccess] = useState(false)

  const handlePublish = () => {
    publish()
    setShowPublishSuccess(true)
    setTimeout(() => setShowPublishSuccess(false), 2000)
  }
  
  const selectedSeries = draftSeries.find(s => s.id === selectedSeriesId)
  
  if (!selectedSeries) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground">
        <LayoutGrid size={48} className="mb-4 opacity-30" />
        <p className="text-lg">请先在左侧选择或创建一个系列</p>
      </div>
    )
  }
  
  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      <div className="p-6 border-b border-border flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-semibold text-foreground">{selectedSeries.title}</h2>
          {selectedSeries.description && (
            <p className="text-muted-foreground mt-1 line-clamp-2 max-w-2xl">{selectedSeries.description}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 py-2 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium whitespace-nowrap"
          >
            <Plus size={18} />
            添加产品
          </button>
          {isDirty && (
            <button
              onClick={discardChanges}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded hover:bg-secondary whitespace-nowrap"
            >
              <RotateCcw size={16} />
              放弃
            </button>
          )}
          <button
            onClick={handlePublish}
            disabled={!isDirty}
            className={`flex items-center gap-2 text-sm px-4 py-2 rounded font-medium transition-all whitespace-nowrap ${
              showPublishSuccess
                ? 'bg-green-600 text-white'
                : isDirty
                  ? 'bg-accent text-accent-foreground hover:bg-accent/90'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed'
            }`}
          >
            {showPublishSuccess ? (
              <>
                <Check size={16} />
                已发布
              </>
            ) : (
              <>
                <Upload size={16} />
                发布
              </>
            )}
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6">
        {selectedSeries.products.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <ImageIcon size={48} className="mb-4 opacity-30" />
            <p className="text-lg">暂无产品</p>
            <p className="text-sm mt-1">点击上方按钮添加第一个产品</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {selectedSeries.products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => setEditingProduct(product)}
                onDelete={() => deleteProduct(selectedSeriesId!, product.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {showAddModal && (
        <AddProductModal
          seriesId={selectedSeriesId!}
          onClose={() => setShowAddModal(false)}
        />
      )}
      
      {editingProduct && (
        <EditProductModal
          seriesId={selectedSeriesId!}
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
        />
      )}
    </div>
  )
}

function ProductCard({ 
  product, 
  onEdit,
  onDelete 
}: { 
  product: Product
  onEdit: () => void
  onDelete: () => void 
}) {
  return (
    <div className="group relative bg-card rounded-lg overflow-hidden border border-border hover:shadow-lg transition-shadow">
      <div 
        className="aspect-square bg-muted overflow-hidden cursor-pointer"
        onClick={onEdit}
      >
        {product.images[0] ? (
          <img 
            src={product.images[0]} 
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon size={32} />
          </div>
        )}
      </div>
      
      <div className="p-4 cursor-pointer" onClick={onEdit}>
        <h3 className="font-semibold text-foreground truncate">{product.title}</h3>
        <div className="flex items-center gap-1 mt-2 text-muted-foreground text-sm">
          {layoutIcons[product.layout]}
          <span>{layoutLabels[product.layout]}</span>
          <span className="mx-1">·</span>
          <span>{product.images.length} 张图片</span>
        </div>
      </div>
      
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onEdit()
          }}
          className="p-2 bg-card/80 backdrop-blur-sm rounded hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors"
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-2 bg-card/80 backdrop-blur-sm rounded hover:bg-destructive hover:text-destructive-foreground text-muted-foreground transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}
