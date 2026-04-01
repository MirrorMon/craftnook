'use client'

import ReactMarkdown from 'react-markdown'
import { LayoutType } from '@/lib/types'

interface ProductDisplayProps {
  product: {
    id: string
    title: string
    description: string
    images: string[]
    layout: LayoutType
  }
  index: number
}

export function ProductDisplay({ product, index }: ProductDisplayProps) {
  const isEven = index % 2 === 0
  const images = product.images || []
  
  if (product.layout === 'large') {
    return (
      <article className="flex flex-col gap-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold text-foreground mb-4">{product.title}</h2>
          <div className="prose prose-stone text-muted-foreground">
            <ReactMarkdown>{product.description}</ReactMarkdown>
          </div>
        </div>
        <div className="flex flex-col gap-6">
          {images.map((img: string, i: number) => (
            <div key={i} className="rounded-lg overflow-hidden bg-muted/30">
              <img 
                src={img} 
                alt={`${product.title} - 图片 ${i + 1}`}
                className="w-full h-auto block"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </article>
    )
  }
  
  if (product.layout === 'double') {
    return (
      <article className={`flex flex-col md:flex-row gap-8 md:gap-12 ${!isEven ? 'md:flex-row-reverse' : ''}`}>
        <div className="md:w-1/2 aspect-[4/5] rounded overflow-hidden bg-muted">
          {images[0] && (
            <img 
              src={images[0]} 
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
          {images.length > 1 && (
            <div className={`mt-8 ${
              images.length === 2 
                ? 'w-3/4' 
                : `grid gap-4 ${images.length === 3 ? 'grid-cols-2' : 'grid-cols-3'}`
            }`}>
              {images.slice(1, 4).map((img: string, i: number) => (
                <div key={i} className="rounded overflow-hidden bg-muted aspect-square">
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
        {images.map((img: string, i: number) => (
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
