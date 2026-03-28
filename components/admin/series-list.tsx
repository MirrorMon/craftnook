'use client'

import { useState } from 'react'
import { useStore } from '@/lib/store'
import { Plus, Trash2, Pencil } from 'lucide-react'
import { AddSeriesModal } from './add-series-modal'
import { EditSeriesModal } from './edit-series-modal'
import type { Series } from '@/lib/types'

export function SeriesList() {
  const { draftSeries, selectedSeriesId, selectSeries, deleteSeries } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)

  return (
    <aside className="w-72 border-r border-border bg-card flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-semibold tracking-wide text-foreground">产品系列</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {draftSeries.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-8">
            暂无系列，请添加第一个系列
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {draftSeries.map((s) => (
              <div
                key={s.id}
                onClick={() => selectSeries(s.id)}
                className={`group relative p-4 rounded cursor-pointer transition-all ${
                  selectedSeriesId === s.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary'
                }`}
              >
                <div className="flex items-center gap-3">
                  {s.coverImage && (
                    <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-muted">
                      <img 
                        src={s.coverImage} 
                        alt={s.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{s.title}</h3>
                    <p className={`text-sm truncate ${
                      selectedSeriesId === s.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {s.products.length} 个产品
                    </p>
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setEditingSeries(s)
                    }}
                    className={`p-1 rounded ${
                      selectedSeriesId === s.id 
                        ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
                        : 'hover:bg-secondary text-muted-foreground'
                    }`}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteSeries(s.id)
                    }}
                    className={`p-1 rounded ${
                      selectedSeriesId === s.id 
                        ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
                        : 'hover:bg-destructive/10 text-destructive'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus size={18} />
          新增系列
        </button>
      </div>
      
      {showModal && <AddSeriesModal onClose={() => setShowModal(false)} />}
      
      {editingSeries && (
        <EditSeriesModal 
          series={editingSeries} 
          onClose={() => setEditingSeries(null)} 
        />
      )}
    </aside>
  )
}
