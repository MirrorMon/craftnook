'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import Link from 'next/link'
import { LayoutGrid, List, Settings } from 'lucide-react'
import type { Series } from '@/lib/types'

export default function HomePage() {
  const { publishedSeries, publishedBrand } = useStore()
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  return (
    <div className="min-h-screen bg-background">
      {/* Brand Hero Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {publishedBrand.logo ? (
                <img 
                  src={publishedBrand.logo} 
                  alt={publishedBrand.name}
                  className="w-20 h-20 object-contain rounded"
                />
              ) : (
                <div className="w-20 h-20 bg-secondary rounded flex items-center justify-center">
                  <span className="text-3xl font-semibold text-foreground">
                    {publishedBrand.name.charAt(0)}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                  {publishedBrand.name}
                </h1>
                {publishedBrand.description && (
                  <p className="text-muted-foreground mt-3 text-lg max-w-xl leading-relaxed">
                    {publishedBrand.description}
                  </p>
                )}
              </div>
            </div>
            <Link 
              href="/admin"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              title="管理后台"
            >
              <Settings size={20} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-medium text-foreground">产品系列</h2>
          <div className="flex items-center gap-1 bg-secondary rounded p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="卡片模式"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-card text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              title="列表模式"
            >
              <List size={18} />
            </button>
          </div>
        </div>

        {/* Series Display */}
        {publishedSeries.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">暂无产品系列</p>
            <Link 
              href="/admin" 
              className="inline-block mt-4 text-accent hover:underline"
            >
              前往管理后台添加
            </Link>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {publishedSeries.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {publishedSeries.map((s) => (
              <SeriesListItem key={s.id} series={s} />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="max-w-6xl mx-auto px-6 py-8 text-center text-muted-foreground text-sm">
          <p>手作工坊 · 用心制作每一件作品</p>
        </div>
      </footer>
    </div>
  )
}

function SeriesCard({ series }: { series: Series }) {
  return (
    <Link href={`/series/${series.id}`} className="group block">
      <div className="aspect-[4/5] rounded overflow-hidden bg-muted mb-4">
        {series.coverImage ? (
          <img 
            src={series.coverImage} 
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <LayoutGrid size={32} />
          </div>
        )}
      </div>
      <h3 className="text-xl font-medium text-foreground group-hover:text-accent transition-colors">
        {series.title}
      </h3>
      {series.description && (
        <p className="text-muted-foreground mt-1 line-clamp-2">{series.description}</p>
      )}
      <p className="text-sm text-muted-foreground mt-2">{series.products.length} 件作品</p>
    </Link>
  )
}

function SeriesListItem({ series }: { series: Series }) {
  return (
    <Link 
      href={`/series/${series.id}`} 
      className="group flex gap-6 p-6 bg-card rounded border border-border hover:shadow-lg transition-shadow"
    >
      <div className="w-32 h-32 flex-shrink-0 rounded overflow-hidden bg-muted">
        {series.coverImage ? (
          <img 
            src={series.coverImage} 
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <LayoutGrid size={24} />
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-xl font-medium text-foreground group-hover:text-accent transition-colors">
          {series.title}
        </h3>
        {series.description && (
          <p className="text-muted-foreground mt-2 line-clamp-2">{series.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-3">{series.products.length} 件作品</p>
      </div>
    </Link>
  )
}
