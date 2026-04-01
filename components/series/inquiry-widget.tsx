'use client'

import { useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

export function InquiryWidget({ seriesTitle }: { seriesTitle: string }) {
  const [showInquiry, setShowInquiry] = useState(false)

  return (
    <>
      <button
        onClick={() => setShowInquiry(true)}
        className="fixed bottom-8 right-8 group flex items-center bg-primary/20 text-primary hover:bg-primary hover:text-primary-foreground p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out font-medium hover:px-6"
      >
        <MessageCircle size={20} className="flex-shrink-0" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-[120px] group-hover:ml-2 transition-all duration-300 ease-in-out">
          询价咨询
        </span>
      </button>

      {showInquiry && (
        <InquiryModal onClose={() => setShowInquiry(false)} seriesTitle={seriesTitle} />
      )}
    </>
  )
}

function InquiryModal({ onClose, seriesTitle }: { onClose: () => void; seriesTitle: string }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      onClose()
    }, 2000)
  }

  return (
    <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">询价咨询</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-secondary rounded transition-colors text-muted-foreground"
          >
            <X size={20} />
          </button>
        </div>
        
        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle size={32} className="text-accent" />
            </div>
            <p className="text-lg font-medium text-foreground">感谢您的咨询</p>
            <p className="text-muted-foreground mt-2">我们会尽快与您联系</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            <p className="text-sm text-muted-foreground">
              {'关于「'}{seriesTitle}{'」系列的咨询'}
            </p>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">您的称呼</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入您的称呼"
                className="px-4 py-3 bg-input border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">联系方式</label>
              <input
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="手机号 / 微信 / 邮箱"
                className="px-4 py-3 bg-input border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground"
                required
              />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">咨询内容</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="请描述您想了解的内容"
                rows={4}
                className="px-4 py-3 bg-input border border-border rounded focus:outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground resize-none"
                required
              />
            </div>
            
            <button
              type="submit"
              className="w-full py-3 px-4 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors font-medium mt-2"
            >
              提交咨询
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
