'use client'

import { X, AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onClose: () => void
  variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmModal({
  title,
  description,
  confirmText = '确认删除',
  cancelText = '取消',
  onConfirm,
  onClose,
  variant = 'danger'
}: ConfirmModalProps) {
  const variantStyles = {
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
    info: 'bg-primary text-primary-foreground hover:bg-primary/90'
  }

  const iconStyles = {
    danger: 'text-destructive bg-destructive/10',
    warning: 'text-yellow-500 bg-yellow-500/10',
    info: 'text-primary bg-primary/10'
  }

  return (
    <div 
      className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-card rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200" 
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-2 rounded-full shrink-0 ${iconStyles[variant]}`}>
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 p-4 bg-secondary/30 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-background border border-border rounded-lg hover:bg-secondary transition-colors font-semibold text-foreground text-sm"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={`flex-1 py-2.5 px-4 rounded-lg transition-colors font-semibold text-sm shadow-sm ${variantStyles[variant]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
