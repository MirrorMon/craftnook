'use client'

import { useState, useRef } from 'react'
import { useStore } from '@/lib/store'
import { X, Upload, ImageIcon } from 'lucide-react'

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.length <= MAX_TITLE_LENGTH) {
      setTitle(value)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const result = reader.result as string
        setCoverImage(result)
        setImagePreview(result)
      }
      reader.readAsDataURL(file)
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
    >
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">新增系列</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-video border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-secondary/50 transition-colors overflow-hidden"
          >
            {imagePreview ? (
              <img src={imagePreview} alt="预览" className="w-full h-full object-cover" />
            ) : (
              <>
                <ImageIcon size={32} className="text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">点击上传封面图片</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
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
              disabled={!title.trim() || !coverImage}
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
