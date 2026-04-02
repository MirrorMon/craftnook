'use client'

import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { X, Upload, ImageIcon } from 'lucide-react'
import { processImageFile } from '@/lib/image-utils'

interface BrandSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function BrandSettingsModal({ isOpen, onClose }: BrandSettingsModalProps) {
  const { draftBrand, updateBrand } = useStore()
  const [name, setName] = useState(draftBrand.name)
  const [description, setDescription] = useState(draftBrand.description)
  const [logo, setLogo] = useState(draftBrand.logo)
  
  // Author fields
  const [authorName, setAuthorName] = useState(draftBrand.authorName)
  const [authorBio, setAuthorBio] = useState(draftBrand.authorBio || '')
  const [authorEmail, setAuthorEmail] = useState(draftBrand.authorEmail || '')
  const [authorWechatId, setAuthorWechatId] = useState(draftBrand.authorWechatId || '')
  const [authorXhsId, setAuthorXhsId] = useState(draftBrand.authorXhsId || '')
  const [authorCustomText, setAuthorCustomText] = useState(draftBrand.authorCustomText || '')
  const [wechatQr, setWechatQr] = useState(draftBrand.authorWechatQr || '')
  const [xhsQr, setXhsQr] = useState(draftBrand.authorXhsQr || '')

  const logoInputRef = useRef<HTMLInputElement>(null)
  const wechatInputRef = useRef<HTMLInputElement>(null)
  const xhsInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setName(draftBrand.name)
      setDescription(draftBrand.description)
      setLogo(draftBrand.logo)
      setAuthorName(draftBrand.authorName)
      setAuthorBio(draftBrand.authorBio || '')
      setAuthorEmail(draftBrand.authorEmail || '')
      setAuthorWechatId(draftBrand.authorWechatId || '')
      setAuthorXhsId(draftBrand.authorXhsId || '')
      setAuthorCustomText(draftBrand.authorCustomText || '')
      setWechatQr(draftBrand.authorWechatQr || '')
      setXhsQr(draftBrand.authorXhsQr || '')
    }
  }, [isOpen, draftBrand])

  if (!isOpen) return null

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        const result = await processImageFile(file)
        setter(result)
      } catch (err) {
        console.error(err)
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    updateBrand({
      name: name.trim(),
      description: description.trim(),
      logo,
      authorName: authorName.trim(),
      authorBio: authorBio.trim(),
      authorEmail: authorEmail.trim(),
      authorWechatId: authorWechatId.trim(),
      authorXhsId: authorXhsId.trim(),
      authorCustomText: authorCustomText.trim(),
      authorWechatQr: wechatQr,
      authorXhsQr: xhsQr
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-card border border-border rounded shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="text-xl font-semibold text-foreground">品牌设置</h2>
          <button 
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-8">
            {/* 品牌设置分区 */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                品牌设置
              </h3>
              
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  品牌 Logo
                </label>
                <div className="flex items-center gap-4">
                  {logo ? (
                    <div className="relative w-24 h-24 rounded overflow-hidden bg-muted border border-border">
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
                      onClick={() => logoInputRef.current?.click()}
                      className="w-24 h-24 rounded border-2 border-dashed border-border hover:border-muted-foreground transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground"
                    >
                      <ImageIcon size={24} />
                      <span className="text-xs">上传 Logo</span>
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*,.heic,.heif"
                    onChange={(e) => handleImageUpload(e, setLogo)}
                    className="hidden"
                  />
                  {logo && (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
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
                  rows={3}
                  className="w-full px-4 py-3 bg-input border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
            </div>

            {/* 作者信息分区 */}
            <div className="space-y-6 pt-6 border-t border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <span className="w-1 h-5 bg-primary rounded-full"></span>
                作者信息
              </h3>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  作者昵称
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="输入作者昵称"
                  className="w-full px-4 py-3 bg-input border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  作者简介
                </label>
                <textarea
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="输入作者简介..."
                  rows={2}
                  className="w-full px-4 py-3 bg-input border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  其它 (如：承接定制、工作室地址等)
                </label>
                <textarea
                  value={authorCustomText}
                  onChange={(e) => setAuthorCustomText(e.target.value)}
                  placeholder="输入其它补充信息..."
                  rows={3}
                  className="w-full px-4 py-3 bg-input border border-border rounded text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              {/* QR Codes */}
              <div className="grid grid-cols-2 gap-6">
                {/* WeChat QR */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    微信二维码
                  </label>
                  <div className="flex flex-col gap-3">
                    {wechatQr ? (
                      <div className="relative w-full aspect-square max-w-[120px] rounded overflow-hidden bg-muted border border-border">
                        <img 
                          src={wechatQr} 
                          alt="Wechat QR" 
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setWechatQr('')}
                          className="absolute top-1 right-1 p-1 bg-foreground/80 text-background rounded-full hover:bg-foreground transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => wechatInputRef.current?.click()}
                        className="w-full aspect-square max-w-[120px] rounded border-2 border-dashed border-border hover:border-muted-foreground transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground"
                      >
                        <Upload size={20} />
                        <span className="text-[10px]">上传微信二维码</span>
                      </div>
                    )}
                    <input
                      ref={wechatInputRef}
                      type="file"
                      accept="image/*,.heic,.heif"
                      onChange={(e) => handleImageUpload(e, setWechatQr)}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* XHS QR */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    小红书二维码
                  </label>
                  <div className="flex flex-col gap-3">
                    {xhsQr ? (
                      <div className="relative w-full aspect-square max-w-[120px] rounded overflow-hidden bg-muted border border-border">
                        <img 
                          src={xhsQr} 
                          alt="XHS QR" 
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setXhsQr('')}
                          className="absolute top-1 right-1 p-1 bg-foreground/80 text-background rounded-full hover:bg-foreground transition-colors"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={() => xhsInputRef.current?.click()}
                        className="w-full aspect-square max-w-[120px] rounded border-2 border-dashed border-border hover:border-muted-foreground transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground"
                      >
                        <Upload size={20} />
                        <span className="text-[10px]">上传小红书二维码</span>
                      </div>
                    )}
                    <input
                      ref={xhsInputRef}
                      type="file"
                      accept="image/*,.heic,.heif"
                      onChange={(e) => handleImageUpload(e, setXhsQr)}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-8 py-2.5 bg-primary text-primary-foreground rounded hover:opacity-90 transition-opacity font-medium shadow-sm"
              >
                保存设置
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
