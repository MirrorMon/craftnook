'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import { X, ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { processImageFile, isImageFile } from '@/lib/image-utils'

interface AddSeriesModalProps {
  onClose: () => void
}

const MAX_TITLE_LENGTH = 20

export function AddSeriesModal({ onClose }: AddSeriesModalProps) {
  const { addSeries } = useStore()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [coverImage, setCoverImage] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const dragDepthRef = useRef(0)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value)
    }
  }

  const applyCoverFile = async (file: File) => {
    try {
      const result = await processImageFile(file)
      setCoverImage(result)
      setImagePreview(result)
    } catch (err: any) {
      console.error(err)
      toast.error(`图片处理失败: ${err.message || '未知错误'}`)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      applyCoverFile(file)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 拖拽上传：进入/离开用计数器抵消子元素冒泡，避免高亮闪烁
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.dataTransfer.types.includes('Files')) return
    dragDepthRef.current += 1
    setIsDragging(true)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer.types.includes('Files')) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1)
    if (dragDepthRef.current === 0) {
      setIsDragging(false)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragDepthRef.current = 0
    setIsDragging(false)

    const file = Array.from(e.dataTransfer.files).find(isImageFile)
    if (!file) {
      toast.error('请拖拽图片文件')
      return
    }
    applyCoverFile(file)
  }

  // 弹窗打开期间拦截上传区域之外的文件拖放，避免浏览器直接打开/下载文件
  const handleOverlayDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.type === 'drop') {
      dragDepthRef.current = 0
      setIsDragging(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim() && coverImage) {
      addSeries(title, description, coverImage)
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      onDragOver={handleOverlayDrag}
      onDrop={handleOverlayDrag}
    >
      <div className="bg-card rounded-md shadow-xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h3 className="text-xl font-semibold text-foreground">新增系列</h3>
          <button
            onClick={onClose}
            className="h-6 w-6 flex items-center justify-center hover:bg-secondary rounded transition-colors text-muted-foreground"
          >
            <X size={16} />
          </button>
        </div>
        
        <form id="add-series-form" onSubmit={handleSubmit} className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-6 flex flex-col gap-5">
          <div 
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full max-w-[256px] mx-auto aspect-[4/5] flex-shrink-0 border-2 border-dashed rounded-md flex flex-col items-center justify-center cursor-pointer transition-colors overflow-hidden ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-secondary/50'
            }`}
          >
            {imagePreview ? (
              <img src={imagePreview} alt="预览" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImageIcon size={32} className={`mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                <p className="text-sm text-muted-foreground">
                  {isDragging ? '松开鼠标即可上传封面' : '点击或拖拽上传封面图片'}
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.heic,.heif"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground">系列标题</label>
              <span className="text-xs text-muted-foreground">{title.length}/{MAX_TITLE_LENGTH}</span>
            </div>
            <input
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="输入系列标题"
              className="px-4 py-3 bg-input border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
              required
              maxLength={MAX_TITLE_LENGTH}
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">系列描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入系列描述（可选）"
              rows={3}
              className="px-4 py-3 bg-input border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
            />
          </div>
        </form>

        {/* Actions（固定在弹窗底部） */}
        <div className="flex gap-3 px-6 py-4 border-t border-border flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 px-4 text-sm border border-border rounded hover:bg-secondary transition-colors font-medium text-foreground"
          >
            取消
          </button>
          <button
            type="submit"
            form="add-series-form"
            disabled={!title.trim() || !coverImage}
            className="flex-1 h-10 px-4 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            确认添加
          </button>
        </div>
      </div>
    </div>
  )
}
