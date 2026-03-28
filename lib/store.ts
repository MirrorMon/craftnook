'use client'

import { create } from 'zustand'
import type { Series, LayoutType, BrandInfo } from './types'

const SAMPLE_SERIES: Series = {
  id: 'sample-series-1',
  title: '山水陶瓷系列',
  description: '灵感源自中国传统山水画，将自然之美融入日常器皿。每一件作品都是对传统工艺的致敬与现代审美的融合。',
  coverImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
  products: [
    {
      id: 'product-1',
      title: '云山茶盏',
      description: '以青瓷为底，手绘远山云雾纹样。\n\n**工艺特点**\n- 高温还原烧制\n- 手工拉坯成型\n- 天然矿物釉料',
      images: [
        'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80',
        'https://images.unsplash.com/photo-1530968033775-2c92736b131e?w=800&q=80'
      ],
      layout: 'large' as LayoutType,
      seriesId: 'sample-series-1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'product-2',
      title: '溪涧花器',
      description: '仿若山间溪流，自然流淌的釉色变化。适合插花或作为独立装饰。',
      images: [
        'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80',
        'https://images.unsplash.com/photo-1493106641515-6b5631de4bb9?w=800&q=80'
      ],
      layout: 'double' as LayoutType,
      seriesId: 'sample-series-1',
      createdAt: new Date().toISOString()
    },
    {
      id: 'product-3',
      title: '松风香炉',
      description: '镂空松枝纹样，香烟袅袅升起如松间清风。',
      images: [
        'https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?w=800&q=80',
        'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
        'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=800&q=80'
      ],
      layout: 'gallery' as LayoutType,
      seriesId: 'sample-series-1',
      createdAt: new Date().toISOString()
    }
  ],
  createdAt: new Date().toISOString()
}

const DEFAULT_BRAND: BrandInfo = {
  name: '手作工坊',
  logo: '',
  description: '专注手工艺品创作，传承东方美学。每一件作品都承载着匠人的心血与温度，让传统工艺走进现代生活。'
}

interface StoreState {
  // Draft state (admin editing)
  draftSeries: Series[]
  draftBrand: BrandInfo
  selectedSeriesId: string | null
  isDirty: boolean
  
  // Published state (frontend display)
  publishedSeries: Series[]
  publishedBrand: BrandInfo
  lastPublished: string | null
  
  // Draft actions
  addSeries: (title: string, description: string, coverImage: string) => void
  updateSeries: (id: string, title: string, description: string, coverImage: string) => void
  deleteSeries: (id: string) => void
  selectSeries: (id: string | null) => void
  addProduct: (seriesId: string, title: string, description: string, images: string[], layout: LayoutType) => void
  updateProduct: (seriesId: string, productId: string, title: string, description: string, images: string[], layout: LayoutType) => void
  deleteProduct: (seriesId: string, productId: string) => void
  updateBrand: (brand: Partial<BrandInfo>) => void
  
  // Publish action
  publish: () => void
  discardChanges: () => void
}

export const useStore = create<StoreState>()((set) => ({
  // Initial draft state
  draftSeries: [SAMPLE_SERIES],
  draftBrand: DEFAULT_BRAND,
  selectedSeriesId: null,
  isDirty: false,
  
  // Initial published state (same as draft initially)
  publishedSeries: [SAMPLE_SERIES],
  publishedBrand: DEFAULT_BRAND,
  lastPublished: new Date().toISOString(),
  
  addSeries: (title, description, coverImage) => set((state) => ({
    draftSeries: [...state.draftSeries, {
      id: crypto.randomUUID(),
      title,
      description,
      coverImage,
      products: [],
      createdAt: new Date().toISOString()
    }],
    isDirty: true
  })),
  
  updateSeries: (id, title, description, coverImage) => set((state) => ({
    draftSeries: state.draftSeries.map(s =>
      s.id === id ? { ...s, title, description, coverImage } : s
    ),
    isDirty: true
  })),
  
  deleteSeries: (id) => set((state) => ({
    draftSeries: state.draftSeries.filter(s => s.id !== id),
    selectedSeriesId: state.selectedSeriesId === id ? null : state.selectedSeriesId,
    isDirty: true
  })),
  
  selectSeries: (id) => set({ selectedSeriesId: id }),
  
  addProduct: (seriesId, title, description, images, layout) => set((state) => ({
    draftSeries: state.draftSeries.map(s => 
      s.id === seriesId 
        ? { ...s, products: [...s.products, {
            id: crypto.randomUUID(),
            title,
            description,
            images,
            layout,
            seriesId,
            createdAt: new Date().toISOString()
          }]}
        : s
    ),
    isDirty: true
  })),
  
  updateProduct: (seriesId, productId, title, description, images, layout) => set((state) => ({
    draftSeries: state.draftSeries.map(s =>
      s.id === seriesId
        ? { ...s, products: s.products.map(p =>
            p.id === productId
              ? { ...p, title, description, images, layout }
              : p
          )}
        : s
    ),
    isDirty: true
  })),
  
  deleteProduct: (seriesId, productId) => set((state) => ({
    draftSeries: state.draftSeries.map(s =>
      s.id === seriesId
        ? { ...s, products: s.products.filter(p => p.id !== productId) }
        : s
    ),
    isDirty: true
  })),
  
  updateBrand: (brandUpdate) => set((state) => ({
    draftBrand: { ...state.draftBrand, ...brandUpdate },
    isDirty: true
  })),
  
  publish: () => set((state) => ({
    publishedSeries: JSON.parse(JSON.stringify(state.draftSeries)),
    publishedBrand: { ...state.draftBrand },
    lastPublished: new Date().toISOString(),
    isDirty: false
  })),
  
  discardChanges: () => set((state) => ({
    draftSeries: JSON.parse(JSON.stringify(state.publishedSeries)),
    draftBrand: { ...state.publishedBrand },
    isDirty: false
  }))
}))
