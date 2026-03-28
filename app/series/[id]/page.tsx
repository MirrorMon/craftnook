'use client'

import { use, useState } from 'react'
import { useStore } from '@/lib/store'
import Link from 'next/link'
import { ArrowLeft, MessageCircle, X } from 'lucide-react'
import type { Product } from '@/lib/types'
import ReactMarkdown from 'react-markdown'

export default function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { publishedSeries } = useStore()
  const [showInquiry, setShowInquiry] = useState(false)
  
  const currentSeries = publishedSeries.find(s => s.id === id)
  
  if (!currentSeries) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">系列不存在</p>
          <Link href="/" className="text-accent hover:underline">返回首页</Link>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            返回首页
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {currentSeries.coverImage && (
              <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={currentSeries.coverImage} 
                  alt={currentSeries.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {currentSeries.title}
              </h1>
              {currentSeries.description && (
                <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
                  {currentSeries.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {currentSeries.products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">该系列暂无产品</p>
          </div>
        ) : (
          <div className="flex flex-col gap-20">
            {currentSeries.products.map((product, index) => (
              <ProductDisplay key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Inquiry Button */}
      <button
        onClick={() => setShowInquiry(true)}
        className="fixed bottom-8 right-8 flex items-center gap-2 bg-primary text-primary-foreground py-4 px-6 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 font-medium"
      >
        <MessageCircle size={20} />
        询价咨询
      </button>

      {/* Inquiry Modal */}
      {showInquiry && <InquiryModal onClose={() => setShowInquiry(false)} seriesTitle={currentSeries.title} />}
    </div>
  )
}

function ProductDisplay({ product, index }: { product: Product; index: number }) {
  const isEven = index % 2 === 0
  
  if (product.layout === 'large') {
    return (
      <article className="flex flex-col gap-8">
        <div className="aspect-[16/10] rounded overflow-hidden bg-muted">
          {product.images[0] && (
            <img 
              src={product.images[0]} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-4">{product.title}</h2>
          <div className="prose prose-stone text-muted-foreground">
            <ReactMarkdown>{product.description}</ReactMarkdown>
          </div>
        </div>
      </article>
    )
  }
  
  if (product.layout === 'double') {
    return (
      <article className={`flex flex-col md:flex-row gap-8 md:gap-12 ${!isEven ? 'md:flex-row-reverse' : ''}`}>
        <div className="md:w-1/2 aspect-[4/5] rounded overflow-hidden bg-muted">
          {product.images[0] && (
            <img 
              src={product.images[0]} 
              alt={product.title}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="md:w-1/2 flex flex-col justify-center">
          <h2 className="text-3xl font-semibold text-foreground mb-4">{product.title}</h2>
          <div className="prose prose-stone text-muted-foreground">
            <ReactMarkdown>{product.description}</ReactMarkdown>
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-3 gap-3 mt-8">
              {product.images.slice(1, 4).map((img, i) => (
                <div key={i} className="aspect-square rounded overflow-hidden bg-muted">
                  <img src={img} alt={`${product.title} ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    )
  }
  
  // Gallery layout
  return (
    <article className="flex flex-col gap-8">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-semibold text-foreground mb-4">{product.title}</h2>
        <div className="prose prose-stone text-muted-foreground max-w-2xl mx-auto">
          <ReactMarkdown>{product.description}</ReactMarkdown>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {product.images.map((img, i) => (
          <div 
            key={i} 
            className={`rounded overflow-hidden bg-muted ${
              i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'
            }`}
          >
            <img src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
        ))}
      </div>
    </article>
  )
}

function InquiryModal({ onClose, seriesTitle }: { onClose: () => void; seriesTitle: string }) {
  const [name, setName] = useState('')
  const [contact, setContact] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send the inquiry to a backend
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
