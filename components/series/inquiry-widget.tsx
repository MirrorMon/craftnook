'use client'

import { useState } from 'react'
import { MessageCircle, X, Mail, MessageSquare, ExternalLink, QrCode } from 'lucide-react'
import { useStore } from '@/lib/store'
import { CopyButton } from '@/components/ui/copy-button'
import Image from 'next/image'
import { cn } from '@/lib/utils'

export function InquiryWidget({ seriesTitle }: { seriesTitle: string }) {
  const [showInquiry, setShowInquiry] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowInquiry(true)}
        className="fixed bottom-8 right-8 group flex items-center bg-primary text-primary-foreground p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out font-medium hover:px-6 z-40"
      >
        <MessageCircle size={20} className="flex-shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[120px] group-hover:ml-2 transition-all duration-300 ease-in-out">
          联系作者
        </span>
      </button>

      {showInquiry && (
        <AuthorCardModal onClose={() => setShowInquiry(false)} />
      )}
    </>
  )
}

function AuthorCardModal({ onClose }: { onClose: () => void }) {
  const brand = useStore((state) => state.publishedBrand)
  const [activeQr, setActiveQr] = useState<'wechat' | 'xhs' | null>(null)

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-2xl shadow-2xl w-full max-w-[400px] overflow-hidden border border-border animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header/Cover */}
        <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-background/50 rounded-full transition-colors text-muted-foreground z-10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-8 -mt-12 relative">
          {/* Brand Info */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-24 h-24 rounded-full border-4 border-card overflow-hidden bg-muted mb-4 shadow-md">
              {brand.logo ? (
                <Image src={brand.logo} alt={brand.name} width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-muted-foreground bg-secondary">
                  {brand.name?.[0]}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{brand.authorName || brand.name}</h3>
            {brand.authorBio && (
              <p className="text-sm text-muted-foreground max-w-[280px] line-clamp-2">
                {brand.authorBio}
              </p>
            )}
          </div>

          {/* Contact List */}
          <div className="space-y-3">
            {/* WeChat */}
            {brand.authorWechatId && (
              <div className="group flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">微信 ID</p>
                    <p className="text-sm font-medium">{brand.authorWechatId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {brand.authorWechatQr && (
                    <button 
                      onClick={() => setActiveQr(activeQr === 'wechat' ? null : 'wechat')}
                      className="p-2 hover:bg-background rounded-lg text-muted-foreground transition-colors"
                      title="查看二维码"
                    >
                      <QrCode size={18} />
                    </button>
                  )}
                  <CopyButton value={brand.authorWechatId} label="微信 ID" />
                </div>
              </div>
            )}

            {/* Xiaohongshu */}
            {brand.authorXhsId && (
              <div className="group flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center text-red-600">
                    <ExternalLink size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">小红书号</p>
                    <p className="text-sm font-medium">{brand.authorXhsId}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {brand.authorXhsQr && (
                    <button 
                      onClick={() => setActiveQr(activeQr === 'xhs' ? null : 'xhs')}
                      className="p-2 hover:bg-background rounded-lg text-muted-foreground transition-colors"
                      title="查看二维码"
                    >
                      <QrCode size={18} />
                    </button>
                  )}
                  <CopyButton value={brand.authorXhsId} label="小红书号" />
                </div>
              </div>
            )}

            {/* Email */}
            {brand.authorEmail && (
              <div className="group flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-transparent hover:border-primary/20 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">电子邮箱</p>
                    <p className="text-sm font-medium">{brand.authorEmail}</p>
                  </div>
                </div>
                <CopyButton value={brand.authorEmail} label="邮箱" />
              </div>
            )}
          </div>

          {/* Custom Text */}
          {brand.authorCustomText && (
            <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-xs text-primary/80 leading-relaxed text-center italic">
                {brand.authorCustomText}
              </p>
            </div>
          )}
        </div>

        {/* QR Code Overlay */}
        {activeQr && (
          <div 
            className="absolute inset-0 bg-background/95 backdrop-blur-md flex flex-col items-center justify-center p-8 z-20 animate-in fade-in duration-200"
            onClick={() => setActiveQr(null)}
          >
            <button className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full">
              <X size={20} />
            </button>
            <p className="text-lg font-bold mb-6">{activeQr === 'wechat' ? '微信二维码' : '小红书二维码'}</p>
            <div className="w-64 h-64 bg-white p-4 rounded-2xl shadow-xl relative">
              <Image 
                src={activeQr === 'wechat' ? brand.authorWechatQr : brand.authorXhsQr} 
                alt="QR Code" 
                width={256} 
                height={256}
                className="w-full h-full object-contain"
              />
            </div>
            <p className="mt-6 text-sm text-muted-foreground">点击任意位置返回</p>
          </div>
        )}
      </div>
    </div>
  )
}
