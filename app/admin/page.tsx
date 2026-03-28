'use client'

import { useState, useEffect } from 'react'
import { SeriesList } from '@/components/admin/series-list'
import { ProductGrid } from '@/components/admin/product-grid'
import { BrandSettingsModal } from '@/components/admin/brand-settings-modal'
import { useStore } from '@/lib/store'
import Link from 'next/link'
import { ExternalLink, Settings2 } from 'lucide-react'

export default function AdminPage() {
  const { draftBrand, isDirty, lastPublished } = useStore()
  const [showBrandModal, setShowBrandModal] = useState(false)
  const [formattedDate, setFormattedDate] = useState<string>('')

  useEffect(() => {
    if (!lastPublished) {
      setFormattedDate('从未发布')
    } else {
      const date = new Date(lastPublished)
      setFormattedDate(date.toLocaleString('zh-CN', { 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }))
    }
  }, [lastPublished])

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {draftBrand.logo ? (
              <img 
                src={draftBrand.logo} 
                alt={draftBrand.name}
                className="w-10 h-10 object-contain rounded"
              />
            ) : (
              <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                <span className="text-lg font-semibold text-foreground">
                  {draftBrand.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{draftBrand.name}</h1>
                {isDirty && (
                  <span className="px-2 py-0.5 bg-accent/20 text-accent text-xs rounded-full">
                    有未发布的更改
                  </span>
                )}
              </div>
              <span className="text-muted-foreground text-xs">
                上次发布: {formattedDate || '-'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowBrandModal(true)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded hover:bg-secondary"
            >
              <Settings2 size={16} />
              品牌设置
            </button>
            <Link 
              href="/" 
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              <ExternalLink size={16} />
              查看前台
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        <SeriesList />
        <ProductGrid />
      </div>

      {/* Brand Settings Modal */}
      <BrandSettingsModal 
        isOpen={showBrandModal} 
        onClose={() => setShowBrandModal(false)} 
      />
    </div>
  )
}
