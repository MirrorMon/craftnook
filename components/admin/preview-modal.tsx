'use client'

import { X } from 'lucide-react'
import { Series } from '@/lib/types'
import { ProductDisplay } from '../series/product-display'
import { InquiryWidget } from '../series/inquiry-widget'

interface PreviewModalProps {
  series: Series
  onClose: () => void
}

export function PreviewModal({ series, onClose }: PreviewModalProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-full transition-colors"
            title="关闭预览"
          >
            <X size={20} />
          </button>
          <span className="text-sm font-medium text-muted-foreground border-l border-border pl-4">
            预览模式：{series.title}
          </span>
        </div>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors text-sm font-medium"
        >
          返回管理界面
        </button>
      </div>

      <div className="min-h-screen pb-24">
        {/* Header - Mimics app/series/[id]/page.tsx */}
        <header className="border-b border-border">
          <div className="max-w-6xl mx-auto px-6 py-12">
            
            <div className="flex flex-col md:flex-row md:items-end gap-8">
              {series.coverImage && (
                <div className="w-32 h-32 rounded-lg overflow-hidden flex-shrink-0 shadow-sm border border-border">
                  <img 
                    src={series.coverImage} 
                    alt={series.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
                  {series.title}
                </h1>
                {series.description && (
                  <p className="text-muted-foreground mt-4 text-xl max-w-3xl leading-relaxed">
                    {series.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Products */}
        <main className="max-w-6xl mx-auto px-6 py-16">
          {!series.products || series.products.length === 0 ? (
            <div className="text-center py-32 bg-secondary/20 rounded-xl border border-dashed border-border">
              <p className="text-muted-foreground text-lg">该系列暂无产品，快去添加吧！</p>
            </div>
          ) : (
            <div className="flex flex-col gap-24">
              {series.products.map((product, index) => (
                <ProductDisplay key={product.id} product={product} index={index} />
              ))}
            </div>
          )}
        </main>

        <InquiryWidget seriesTitle={series.title} />
      </div>
      
      {/* Footer mimic */}
      <footer className="border-t border-border bg-secondary/10">
        <div className="max-w-6xl mx-auto px-6 py-12 flex items-center justify-between text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} 您的品牌名称</p>
          <p>Powered by CraftTool</p>
        </div>
      </footer>
    </div>
  )
}
