'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { X, Upload, ImageIcon } from 'lucide-react'

interface BrandSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BrandSettingsModal({ isOpen, onClose }: BrandSettingsModalProps) {
  const { draftBrand, updateBrand } = useStore()
  const [name, setName] = useState(draftBrand.name)
  const [description, setDescription] = useState(draftBrand.description)
  const [logo, setLogo] = useState(draftBrand.logo)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName(draftBrand.name)
      setDescription(draftBrand.description)
      setLogo(draftBrand.logo)
    }
  }, [isOpen, draftBrand])

  if (!isOpen) return null

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setLogo(result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    updateBrand({
      name: name.trim(),
      description: description.trim(),
      logo
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">品牌设置</h2>
          <button 
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              品牌 Logo
            </label>
            <div className="flex items-center gap-4">
              {logo ? (
                <div className="relative w-24 h-24 rounded overflow-hidden bg-muted">
                  <img 
                    src={logo} 
                    alt="Logo preview" 
                    className="w-full h-full object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setLogo('')}
                    className="absolute top-1 right-1 p-1 bg-foreground/80 text-background rounded-full hover:bg-foreground transition-colors"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded border-2 border-dashed border-border hover:border-muted-foreground transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground"
                >
                  <ImageIcon size={24} />
                  <span className="text-xs">上传</span>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
              {logo && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 text-sm border border-border rounded hover:bg-secondary transition-colors text-foreground"
                >
                  更换图片
                </button>
              )}
            </div>
          </div>

          {/* Brand Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              品牌名称 <span className="text-accent">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入品牌名称"
              className="w-full px-4 py-3 bg-input border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              required
            />
          </div>

          {/* Brand Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              品牌介绍
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入品牌介绍..."
              rows={4}
              className="w-full px-4 py-3 bg-input border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity font-medium"
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
