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
  /** 有未发布的修改（草稿与已发布快照不一致） */
  isDirty: boolean
  /** 当前是否在线（前台可见） */
  isPublished: boolean
  /** 是否存在已发布快照（"放弃"还原的前提） */
  hasSnapshot: boolean
}

export interface PublishedSnapshotProduct {
  id: string
  title: string
  description: string
  images: string[]
  layout: LayoutType
  position: number | null
}

/** 存储在 series.published_snapshot 里的"已发布版本"内容 */
export interface PublishedSnapshot {
  title: string
  description: string
  cover_image: string
  products: PublishedSnapshotProduct[]
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
