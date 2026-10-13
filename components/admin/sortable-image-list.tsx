'use client'

import { useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToParentElement, restrictToFirstScrollableAncestor } from '@dnd-kit/modifiers'
import { Trash2, Loader2 } from 'lucide-react'

interface SortableImageItemProps {
  id: string
  url: string | null
  isProcessing?: boolean
  index: number
  onRemove: (index: number) => void
}

function SortableImageItem({ id, url, isProcessing, index, onRemove }: SortableImageItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    disabled: isProcessing 
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 0,
    opacity: isDragging ? 0.9 : 1,
    scale: isDragging ? '1.05' : '1',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square rounded-md overflow-hidden group transition-all ${
        isDragging 
          ? 'shadow-2xl ring-2 ring-primary ring-offset-2 ring-offset-background' 
          : 'border border-border'
      } ${
        isProcessing ? 'bg-secondary/30' : ''
      }`}
    >
      {url ? (
        <>
          <div 
            {...attributes} 
            {...listeners}
            className="absolute inset-0 z-10 cursor-move"
          />
          <img src={url} alt={`图片 ${index + 1}`} className="w-full h-full object-cover pointer-events-none select-none" />
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px] z-20">
              <Loader2 size={24} className="text-white animate-spin" />
            </div>
          )}
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation()
              onRemove(index)
            }}
            className="absolute top-2 right-2 h-6 w-6 flex items-center justify-center bg-background/90 hover:bg-destructive text-foreground hover:text-destructive-foreground rounded-md opacity-0 group-hover:opacity-100 transition-all z-30 shadow-sm backdrop-blur-sm"
            aria-label="删除图片"
          >
            <Trash2 size={16} />
          </button>
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <Loader2 size={24} className="text-primary/40 animate-spin" />
        </div>
      )}
    </div>
  )
}

interface ImageItem {
  id: string
  url: string | null
  isProcessing?: boolean
}

interface SortableImageListProps {
  images: ImageItem[]
  onReorder: (newImages: ImageItem[]) => void
  onRemove: (index: number) => void
}

export function SortableImageList({ images, onReorder, onRemove }: SortableImageListProps) {
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex(item => item.id === active.id)
      const newIndex = images.findIndex(item => item.id === over.id)
      
      const newImages = arrayMove(images, oldIndex, newIndex)
      onReorder(newImages)
    }
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
      modifiers={[restrictToParentElement, restrictToFirstScrollableAncestor]}
    >
      <SortableContext 
        items={images.map(img => img.id)}
        strategy={rectSortingStrategy}
      >
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mt-4">
          {images.map((item, index) => (
            <SortableImageItem 
              key={item.id} 
              id={item.id} 
              url={item.url} 
              isProcessing={item.isProcessing}
              index={index}
              onRemove={onRemove}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
