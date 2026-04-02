'use client'

import { useState } from 'react'
import { MessageCircle, X, QrCode } from 'lucide-react'
import { useStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import type { BrandInfo } from '@/lib/types'

export function InquiryWidget({ seriesTitle, brand: initialBrand }: { seriesTitle: string, brand?: BrandInfo | null }) {
  const [showInquiry, setShowInquiry] = useState(false)
  const publishedBrand = useStore((state) => state.publishedBrand)
  const brand = initialBrand || publishedBrand

  return (
    <>
      <button
        onClick={() => setShowInquiry(true)}
        className="fixed bottom-8 right-8 group flex items-center bg-primary text-primary-foreground p-4 rounded-full shadow-2xl transition-all duration-300 ease-in-out font-medium hover:px-6 z-[999] ring-2 ring-primary/20"
      >
        <MessageCircle size={20} className="flex-shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[120px] group-hover:ml-2 transition-all duration-300 ease-in-out">
          联系作者
        </span>
      </button>

      {showInquiry && brand && (
        <AuthorCardModal onClose={() => setShowInquiry(false)} initialBrand={brand} />
      )}
    </>
  )
}

function AuthorCardModal({ onClose, initialBrand }: { onClose: () => void, initialBrand?: BrandInfo | null }) {
  const publishedBrand = useStore((state) => state.publishedBrand)
  const brand = initialBrand || publishedBrand

  if (!brand || !brand.name) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-card rounded-md shadow-2xl w-full max-w-[400px] overflow-hidden animate-in fade-in zoom-in duration-200 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground z-10"
        >
          <X size={20} />
        </button>

        <div className="px-6 pb-8 pt-10 relative">
          {/* Brand Info */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-white mb-4 border border-border/50 flex items-center justify-center">
              {brand.logo ? (
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xl font-bold text-muted-foreground bg-secondary/30">
                  {brand.name?.[0]}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{brand.authorName || brand.name}</h3>
            {brand.authorBio && (
              <p className="text-sm text-muted-foreground/80 max-w-[280px] line-clamp-2 leading-relaxed">
                {brand.authorBio}
              </p>
            )}
          </div>

          {/* QR Codes Section */}
          {(brand.authorWechatQr || brand.authorXhsQr) && (
            <div className="mt-4 flex justify-center gap-6">
              {brand.authorWechatQr && (
                <div className="flex flex-col items-center bg-white p-3 rounded-md border border-border/50 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  <div className="w-32 h-32 mb-3">
                    <img src={brand.authorWechatQr} alt="Wechat QR" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm text-muted-foreground/80 font-medium">扫码添加微信</p>
                </div>
              )}
              {brand.authorXhsQr && (
                <div className="flex flex-col items-center bg-white p-3 rounded-md border border-border/50 shadow-[0_4px_12px_rgba(0,0,0,0.1)]">
                  <div className="w-32 h-32 mb-3">
                    <img src={brand.authorXhsQr} alt="XHS QR" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm text-muted-foreground/80 font-medium">扫码查看小红书</p>
                </div>
              )}
            </div>
          )}

          {/* Custom Text */}
          {brand.authorCustomText && (
            <div className="mt-8 pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground/80 leading-relaxed text-left whitespace-pre-wrap">
                {brand.authorCustomText}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
