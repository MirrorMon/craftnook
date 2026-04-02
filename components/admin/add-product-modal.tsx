'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { X, Upload, LayoutGrid, Columns2, Image as GalleryIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { LayoutType } from '@/lib/types'
import { processImageFile } from '@/lib/image-utils'
import { SortableImageList } from './sortable-image-list'

interface AddProductModalProps {
  seriesId: string
  onClose: () => void
}

const layoutOptions: { value: LayoutType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'large', label: '大图', icon: <LayoutGrid size={20} />, description: '单张大图展示' },
  { value: 'double', label: '双列', icon: <Columns2 size={20} />, description: '两列并排布局' },
  { value: 'gallery', label: '画廊', icon: <GalleryIcon size={20} />, description: '多图画廊模式' }
]

const MAX_TITLE_LENGTH = 20

export function AddProductModal({ seriesId, onClose }: AddProductModalProps) {
  const { addProduct } = useStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<{ id: string; url: string | null; isProcessing?: boolean }[]>([])
  const [layout, setLayout] = useState<LayoutType>('large')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imagesRef = useRef(images)

  // 始终保持对最新 images 的引用，以便在卸载时清理 blob URL
  useEffect(() => {
    imagesRef.current = images
  }, [images])

  // 组件卸载时清理所有未销毁的 blob URL
  useEffect(() => {
    return () => {
      imagesRef.current.forEach(img => {
        if (img.url?.startsWith('blob:')) {
          URL.revokeObjectURL(img.url)
        }
      })
    }
  }, [])

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // Add placeholders immediately for all files with local preview URLs
    const newItems = files.map((file) => ({
      id: crypto.randomUUID(),
      // 为非 HEIC 文件创建临时预览，HEIC 在浏览器中通常无法直接通过 img 标签显示
      url: (file.name.toLowerCase().endsWith('.heic') || file.type === 'image/heic') 
        ? null 
        : URL.createObjectURL(file),
      isProcessing: true
    }))
    
    setImages(prev => [...prev, ...newItems])

    // 并发控制：最多同时处理 2 张图片
    let fileIndex = 0;
    const processNext = async () => {
      if (fileIndex >= files.length) return;
      
      const currentIndex = fileIndex++;
      const file = files[currentIndex];
      const targetId = newItems[currentIndex].id;

      try {
        const result = await processImageFile(file)
        setImages(prev => {
          const target = prev.find(img => img.id === targetId);
          // 如果旧的 URL 是 blob URL，销毁它以释放内存
          if (target?.url?.startsWith('blob:')) {
            URL.revokeObjectURL(target.url);
          }
          return prev.map(img => 
            img.id === targetId ? { ...img, url: result, isProcessing: false } : img
          );
        })
      } catch (err: any) {
        console.error('Image processing error:', err)
        toast.error(`图片处理失败: ${err.message || '未知错误'}`)
        setImages(prev => {
          const target = prev.find(img => img.id === targetId);
          if (target?.url?.startsWith('blob:')) {
            URL.revokeObjectURL(target.url);
          }
          return prev.filter(img => img.id !== targetId);
        })
      } finally {
        // 递归处理下一个任务
        processNext();
      }
    }

    // 开启 2 个并行 worker
    processNext();
    if (files.length > 1) {
      processNext();
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImages(prev => {
      const img = prev[index];
      if (img.url?.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
      return prev.filter((_, i) => i !== index);
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validImages = images.filter(img => img.url && !img.isProcessing).map(img => img.url!)
    if (title.trim() && validImages.length > 0) {
      addProduct(seriesId, title, description, validImages, layout)
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-md shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">添加产品</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto overflow-x-hidden p-6 flex flex-col gap-5">
          {/* Image Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>产品图片（支持多图）</span>
              {images.length > 0 && (
                <span className="text-xs text-muted-foreground font-normal bg-secondary px-2 py-0.5 rounded-full">
                  已选 {images.length} 张
                </span>
              )}
            </label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors"
            >
              <Upload size={24} className="text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                点击或拖拽上传图片
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.heic,.heif"
                multiple
                onChange={handleImagesChange}
                className="hidden"
              />
            </div>
            
            {images.length > 0 && (
              <SortableImageList 
                images={images} 
                onReorder={setImages} 
                onRemove={removeImage} 
              />
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
              disabled={!title.trim() || images.length === 0 || images.some(img => img.isProcessing)}
              className="flex-1 py-3 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              确认添加
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
