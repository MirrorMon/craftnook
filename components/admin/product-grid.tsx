'use client'

import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { 
  Plus, Trash2, LayoutGrid, Columns2, Image as ImageIcon, Pencil, 
  Upload, RotateCcw, Check, Loader2, GripVertical, EyeOff 
} from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToFirstScrollableAncestor, restrictToWindowEdges } from '@dnd-kit/modifiers'

import { AddProductModal } from './add-product-modal'
import { EditProductModal } from './edit-product-modal'
import { ConfirmModal } from '../ui/confirm-modal'
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
  const { draftSeries, selectedSeriesId, deleteProduct, reorderProducts, publish, unpublish, discardChanges, isSyncing } = useStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productToDelete, setProductToDelete] = useState<string | null>(null)
  const [isPublishing, setIsPublishing] = useState(false)
  const [showPublishSuccess, setShowPublishSuccess] = useState(false)

  const selectedSeries = draftSeries.find(s => s.id === selectedSeriesId)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id && selectedSeries) {
      const oldIndex = selectedSeries.products.findIndex((p) => p.id === active.id)
      const newIndex = selectedSeries.products.findIndex((p) => p.id === over.id)

      const newProducts = arrayMove(selectedSeries.products, oldIndex, newIndex)
      reorderProducts(selectedSeriesId!, newProducts)
    }
  }

  // Debug log to trace state updates
  useEffect(() => {
    if (selectedSeries) {
      console.log(`[ProductGrid] Rendering series "${selectedSeries.title}" with ${selectedSeries.products.length} products`)
    }
  }, [selectedSeries])

  const handlePublish = async () => {
    if (selectedSeriesId) {
      setIsPublishing(true)
      const success = await publish(selectedSeriesId)
      setIsPublishing(false)
      
      if (success) {
        setShowPublishSuccess(true)
        setTimeout(() => setShowPublishSuccess(false), 2000)
      }
    }
  }
  
  const handleDiscard = () => {
    if (selectedSeriesId) {
      discardChanges(selectedSeriesId)
    }
  }
  
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
          {selectedSeries.isPublished && !selectedSeries.isDirty && (
            <button
              onClick={() => unpublish(selectedSeriesId!)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-red-500 transition-colors px-3 py-2 rounded-md hover:bg-red-50 whitespace-nowrap"
            >
              <EyeOff size={16} />
              取消发布
            </button>
          )}
          {(selectedSeries.isDirty || showPublishSuccess) && (
            <div className="flex items-center gap-3">
              {selectedSeries.isDirty && !showPublishSuccess && (
                <button
                  onClick={handleDiscard}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-md hover:bg-secondary whitespace-nowrap"
                >
                  <RotateCcw size={16} />
                  放弃
                </button>
              )}
              <button
                onClick={handlePublish}
                disabled={(!selectedSeries.isDirty && !showPublishSuccess) || isPublishing || isSyncing}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-md font-medium transition-all whitespace-nowrap ${
                  showPublishSuccess
                    ? 'bg-green-600 text-white'
                    : (isPublishing || isSyncing)
                    ? 'bg-accent/50 text-accent-foreground cursor-not-allowed'
                    : 'bg-accent text-accent-foreground hover:bg-accent/90'
                }`}
              >
                {(isPublishing || isSyncing) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isSyncing ? '同步中...' : '发布中...'}
                  </>
                ) : showPublishSuccess ? (
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
          )}
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 py-2 px-4 bg-primary text-primary-foreground rounded-[4px] hover:bg-primary/90 transition-colors font-medium whitespace-nowrap"
          >
            <Plus size={18} />
            添加产品
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToFirstScrollableAncestor]}
          >
            <SortableContext
              items={selectedSeries.products.map(p => p.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {selectedSeries.products.map((product) => (
                  <SortableProductCard
                    key={product.id}
                    product={product}
                    onEdit={() => setEditingProduct(product)}
                    onDelete={() => setProductToDelete(product.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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

      {productToDelete && (
        <ConfirmModal
          title="删除产品"
          description={`确定要删除“${selectedSeries?.products.find(p => p.id === productToDelete)?.title}”吗？此操作不可撤销。`}
          onConfirm={() => {
            deleteProduct(selectedSeriesId!, productToDelete)
            setProductToDelete(null)
          }}
          onClose={() => setProductToDelete(null)}
        />
      )}
    </div>
  )
}

function SortableProductCard({ 
  product, 
  onEdit,
  onDelete 
}: { 
  product: Product
  onEdit: () => void
  onDelete: () => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`group relative bg-card rounded-[4px] overflow-hidden border border-border hover:shadow-lg transition-all ${
        isDragging ? 'shadow-2xl ring-2 ring-primary' : ''
      }`}
    >
      {/* Drag Handle */}
      <div 
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 p-1.5 bg-card/80 backdrop-blur-sm rounded-md border border-border cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={16} className="text-muted-foreground" />
      </div>

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

