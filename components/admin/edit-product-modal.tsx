'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { X, Upload, Trash2, LayoutGrid, Columns2, Image as GalleryIcon } from 'lucide-react'
import type { LayoutType, Product } from '@/lib/types'

interface EditProductModalProps {
  seriesId: string
  product: Product
  onClose: () => void
}

const layoutOptions: { value: LayoutType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'large', label: '大图', icon: <LayoutGrid size={20} />, description: '单张大图展示' },
  { value: 'double', label: '双列', icon: <Columns2 size={20} />, description: '两列并排布局' },
  { value: 'gallery', label: '画廊', icon: <GalleryIcon size={20} />, description: '多图画廊模式' }
]

const MAX_TITLE_LENGTH = 20

export function EditProductModal({ seriesId, product, onClose }: EditProductModalProps) {
  const { updateProduct } = useStore()
  const [title, setTitle] = useState(product.title)
  const [description, setDescription] = useState(product.description)
  const [images, setImages] = useState<string[]>(product.images)
  const [layout, setLayout] = useState<LayoutType>(product.layout)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImages(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && images.length > 0) {
      updateProduct(seriesId, product.id, title, description, images, layout)
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">编辑产品</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-5">
          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">产品图片（支持多图）</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors"
            >
              <Upload size={24} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">点击或拖拽上传图片</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagesChange}
                className="hidden"
              />
            </div>
            
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-3 mt-3">
                {images.map((img, index) => (
                  <div key={index} className="relative aspect-square rounded overflow-hidden group">
                    <img src={img} alt={`预览 ${index + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute inset-0 bg-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={20} className="text-primary-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Title */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">产品标题</label>
              <span className="text-xs text-muted-foreground">{title.length}/{MAX_TITLE_LENGTH}</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={(e) => e.target.value.length <= MAX_TITLE_LENGTH && setTitle(e.target.value)}
              placeholder="输入产品标题"
              className="px-4 py-3 bg-input border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              required
              maxLength={MAX_TITLE_LENGTH}
            />
          </div>
          
          {/* Description with Markdown hint */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              产品描述 <span className="text-muted-foreground font-normal">（支持 Markdown）</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入产品描述，支持 Markdown 格式"
              rows={4}
              className="px-4 py-3 bg-input border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none font-mono text-sm"
            />
          </div>
          
          {/* Layout Selection */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">排版方式</label>
            <div className="grid grid-cols-3 gap-3">
              {layoutOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLayout(option.value)}
                  className={`p-4 rounded border-2 transition-all flex flex-col items-center gap-2 ${
                    layout === option.value
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className={layout === option.value ? 'text-primary' : 'text-muted-foreground'}>
                    {option.icon}
                  </span>
                  <span className={`text-sm font-medium ${layout === option.value ? 'text-primary' : 'text-foreground'}`}>
                    {option.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-border rounded hover:bg-secondary transition-colors font-medium text-foreground"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!title.trim() || images.length === 0}
              className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              保存修改
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
