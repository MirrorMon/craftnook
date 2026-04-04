export type LayoutType = 'large' | 'double' | 'gallery'

export interface Product {
  id: string
  title: string
  description: string
  images: string[]
  layout: LayoutType
  seriesId: string
  position?: number
  createdAt: string
}

export interface Series {
  id: string
  title: string
  description: string
  coverImage: string
  products: Product[]
  createdAt: string
  lastPublished: string | null
  isDirty: boolean
  isPublished: boolean
}

export interface BrandInfo {
  name: string
  logo: string
  description: string
  authorName: string
  authorBio?: string
  authorEmail?: string
  authorWechatId?: string
  authorWechatQr?: string
  authorXhsId?: string
  authorXhsQr?: string
  authorCustomText?: string
}

export interface DraftState {
  series: Series[]
  brand: BrandInfo
  isDirty: boolean
  lastPublished: string | null
}
