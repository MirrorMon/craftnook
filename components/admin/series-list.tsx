'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/lib/store'
import { toast } from 'sonner'
import { Plus, Trash2, Pencil, Eye } from 'lucide-react'
import { AddSeriesModal } from './add-series-modal'
import { EditSeriesModal } from './edit-series-modal'
import { PreviewModal } from './preview-modal'
import { ConfirmModal } from '../ui/confirm-modal'
import type { Series } from '@/lib/types'

function ClientDate({ date }: { date: string }) {
  const [formatted, setFormatted] = useState<string | null>(null)

  useEffect(() => {
    setFormatted(new Date(date).toLocaleDateString('zh-CN', {
      month: 'numeric',
      day: 'numeric'
    }))
  }, [date])

  if (!formatted) return null

  return <>{formatted}</>
}

export function SeriesList() {
  const { draftSeries, selectedSeriesId, selectSeries, deleteSeries } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [editingSeries, setEditingSeries] = useState<Series | null>(null)
  const [previewingSeries, setPreviewingSeries] = useState<Series | null>(null)
  const [seriesToDelete, setSeriesToDelete] = useState<string | null>(null)

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
                    : 'hover:bg-[#F7F8F8]'
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
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium truncate">{s.title}</h3>
                      {!s.isPublished ? (
                        <span className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] rounded-full ${
                          selectedSeriesId === s.id
                            ? 'bg-primary-foreground/20 text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}>
                          未发布
                        </span>
                      ) : s.isDirty ? (
                        <span className="flex-shrink-0 px-1.5 py-0.5 bg-destructive/20 text-destructive text-[10px] rounded-full">
                          修改未发布
                        </span>
                      ) : null}
                    </div>
                    <p className={`text-xs truncate ${
                      selectedSeriesId === s.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {s.products.length} 个产品
                    </p>
                    <div className="flex items-center justify-between gap-2 mt-0.5">
                      {s.lastPublished ? (
                        <span className={`text-[10px] truncate ${
                          selectedSeriesId === s.id ? 'text-primary-foreground/50' : 'text-muted-foreground/60'
                        }`}>
                          发布于: <ClientDate date={s.lastPublished} />
                        </span>
                      ) : (
                        <span className={`text-[10px] truncate ${
                          selectedSeriesId === s.id ? 'text-primary-foreground/50' : 'text-muted-foreground/60'
                        }`}>
                          从未发布
                        </span>
                      )}
                      <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setPreviewingSeries(s)
                          }}
                          title="预览系列"
                          className={`h-6 w-6 flex items-center justify-center rounded ${
                            selectedSeriesId === s.id 
                              ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
                              : 'hover:bg-[rgba(175,175,175,0.1)] text-muted-foreground'
                          }`}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingSeries(s)
                          }}
                          title="编辑系列"
                          className={`h-6 w-6 flex items-center justify-center rounded ${
                            selectedSeriesId === s.id 
                              ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
                              : 'hover:bg-[rgba(175,175,175,0.1)] text-muted-foreground'
                          }`}
                        >
                          <Pencil size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            // 在线系列必须先下线（前台可见性只由"发布/下线"改变）
                            if (s.isPublished) {
                              toast.error('该系列当前在线：请先点"取消发布"，再删除')
                              return
                            }
                            setSeriesToDelete(s.id)
                          }}
                          title="删除系列"
                          className={`h-6 w-6 flex items-center justify-center rounded ${
                            selectedSeriesId === s.id 
                              ? 'hover:bg-primary-foreground/20 text-primary-foreground' 
                              : 'hover:bg-[rgba(175,175,175,0.1)] text-destructive'
                          }`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-4 border-t border-border">
        <button
          onClick={() => setShowModal(true)}
          className="w-full flex items-center justify-center gap-2 h-10 px-4 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium"
        >
          <Plus size={18} />
          新增系列
        </button>
      </div>
      
      {showModal && <AddSeriesModal onClose={() => setShowModal(false)} />}
      
      {seriesToDelete && (
        <ConfirmModal
          title="删除系列"
          description={`确定要删除“${draftSeries.find(s => s.id === seriesToDelete)?.title}”吗？这将永久删除该系列及其下的所有产品信息。`}
          onConfirm={() => deleteSeries(seriesToDelete)}
          onClose={() => setSeriesToDelete(null)}
        />
      )}
      
      {editingSeries && (
        <EditSeriesModal 
          series={editingSeries} 
          onClose={() => setEditingSeries(null)} 
        />
      )}

      {previewingSeries && (
        <PreviewModal
          series={previewingSeries}
          onClose={() => setPreviewingSeries(null)}
        />
      )}
    </aside>
  )
}
