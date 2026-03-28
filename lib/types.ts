export type LayoutType = 'large' | 'double' | 'gallery'

export interface Product {
  id: string
  title: string
  description: string
  images: string[]
  layout: LayoutType
  seriesId: string
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
}

export interface BrandInfo {
  name: string
  logo: string
  description: string
}

export interface DraftState {
  series: Series[]
  brand: BrandInfo
  isDirty: boolean
  lastPublished: string | null
}
