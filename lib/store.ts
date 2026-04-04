'use client'

import { create } from 'zustand'
import type { Series, LayoutType, BrandInfo, Product } from './types'
import { createClient } from './supabase/client'
import { uploadImage, deleteImagesFromUrls } from './supabase/storage'
import { toast } from 'sonner'
import { publishSeriesAction, publishAllAction, unpublishSeriesAction } from '@/app/actions/publish'

async function uploadIfNeeded(urlOrBase64: string): Promise<string> {
  if (!urlOrBase64.startsWith('data:image/')) return urlOrBase64;
  try {
    const res = await fetch(urlOrBase64);
    const blob = await res.blob();
    const file = new File([blob], `upload_${Date.now()}.${blob.type.split('/')[1] || 'jpg'}`, { type: blob.type });
    const uploadedUrl = await uploadImage(file);
    return uploadedUrl || urlOrBase64;
  } catch (err) {
    console.error('Error converting base64 to file', err);
    return urlOrBase64;
  }
}

const DEFAULT_BRAND: BrandInfo = {
  name: '手作工坊',
  logo: '',
  description: '以手造物，以物寄心',
  authorName: '匠人'
}

interface StoreState {
  // Config
  userId: string | null
  username: string | null
  isInitialized: boolean
  isSyncing: boolean

  // Draft state (admin editing)
  draftSeries: Series[]
  draftBrand: BrandInfo
  selectedSeriesId: string | null
  isBrandDirty: boolean

  // Published state (frontend display)
  publishedSeries: Series[]
  publishedBrand: BrandInfo
  lastPublished: string | null

  // Init
  initStore: () => Promise<void>

  // Draft actions
  addSeries: (title: string, description: string, coverImage: string) => Promise<void>
  updateSeries: (id: string, title: string, description: string, coverImage: string) => Promise<void>
  deleteSeries: (id: string) => Promise<void>
  selectSeries: (id: string | null) => void
  addProduct: (seriesId: string, title: string, description: string, images: string[], layout: LayoutType) => Promise<void>
  updateProduct: (seriesId: string, productId: string, title: string, description: string, images: string[], layout: LayoutType) => Promise<void>
  deleteProduct: (seriesId: string, productId: string) => Promise<void>
  reorderProducts: (seriesId: string, newProducts: Product[]) => Promise<void>
  updateBrand: (brand: Partial<BrandInfo>) => Promise<void>

  // Publish action
  publish: (seriesId?: string) => Promise<boolean>
  unpublish: (seriesId: string) => Promise<boolean>
  discardChanges: (seriesId?: string) => void
}

export const useStore = create<StoreState>()((set, get) => {
  const supabase = createClient()

  return {
    userId: null,
    username: null,
    isInitialized: false,
    isSyncing: false,
    draftSeries: [],
    draftBrand: DEFAULT_BRAND,
    selectedSeriesId: null,
    isBrandDirty: false,

    publishedSeries: [],
    publishedBrand: DEFAULT_BRAND,
    lastPublished: null,

    initStore: async () => {
      if (get().isInitialized) return

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const userId = user.id

      // Fetch Profile for Username
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single()

      const username = profileData?.username || null

      // Fetch Brand
      const { data: brandData } = await supabase
        .from('brand_info')
        .select('*')
        .eq('user_id', userId)
        .single()

      const brand: BrandInfo = brandData ? {
        name: brandData.name,
        logo: brandData.logo || '',
        description: brandData.description || '',
        authorName: brandData.author_name || brandData.name,
        authorBio: brandData.author_bio || '',
        authorEmail: brandData.author_email || '',
        authorWechatId: brandData.author_wechat_id || '',
        authorWechatQr: brandData.author_wechat_qr || '',
        authorXhsId: brandData.author_xhs_id || '',
        authorXhsQr: brandData.author_xhs_qr || '',
        authorCustomText: brandData.author_custom_text || ''
      } : DEFAULT_BRAND

      // Fetch Series
      const { data: seriesData } = await supabase
        .from('series')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Fetch Products
      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('position', { ascending: true })
        .order('created_at', { ascending: true })

      const parsedSeries: Series[] = (seriesData || []).map(s => {
        const productsOfSeries = (productsData || []).filter(p => p.series_id === s.id).map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          images: p.images || [],
          layout: p.layout as LayoutType,
          seriesId: p.series_id,
          position: p.position,
          createdAt: p.created_at
        }))

        return {
          id: s.id,
          title: s.title,
          description: s.description || '',
          coverImage: s.cover_image || '',
          products: productsOfSeries,
          createdAt: s.created_at,
          lastPublished: s.last_published_at,
          isDirty: !s.is_published, // If not published, effectively dirty/draft
          isPublished: s.is_published
        }
      })

      const currentSelectedId = get().selectedSeriesId
      const newSelectedId = (parsedSeries.some(s => s.id === currentSelectedId))
        ? currentSelectedId
        : (parsedSeries[0]?.id || null)

      set({
        userId,
        username,
        isInitialized: true,
        draftSeries: parsedSeries,
        publishedSeries: parsedSeries.filter(s => !s.isDirty),
        draftBrand: brand,
        publishedBrand: brand,
        selectedSeriesId: newSelectedId,
        isSyncing: false
      })

      // @ts-ignore - Expose for debugging
      window.checkStore = () => {
        const state = get()
        console.log('[Store Debug] Current State:', {
          selectedId: state.selectedSeriesId,
          draftSeries: state.draftSeries.map(s => ({
            id: s.id,
            title: s.title,
            productCount: s.products.length,
            products: s.products
          }))
        })
      }
    },

    addSeries: async (title, description, coverImage) => {
      const state = get()
      if (!state.userId) return

      const id = crypto.randomUUID()
      const newSeries = {
        id,
        title,
        description,
        coverImage,
        products: [],
        createdAt: new Date().toISOString(),
        lastPublished: null,
        isDirty: true,
        isPublished: false
      }

      set({ isSyncing: true })

      try {
        const uploadedCover = await uploadIfNeeded(coverImage)

        const { error } = await supabase.from('series').insert({
          id,
          user_id: state.userId,
          title,
          description,
          cover_image: uploadedCover,
          is_published: false
        })
        console.time('addSeries')
        if (error) throw error

        set({
          draftSeries: [newSeries, ...state.draftSeries],
          selectedSeriesId: id,
          isSyncing: false
        })
        console.timeEnd('addSeries')
      } catch (err: any) {
        set({ isSyncing: false })
        console.error('Error adding series:', err)
        toast.error(`添加失败: ${err.message}`)
      }
    },

    updateSeries: async (id, title, description, coverImage) => {
      set({ isSyncing: true })
      try {
        const oldSeries = get().draftSeries.find(s => s.id === id)
        const oldCover = oldSeries?.coverImage

        const uploadedCover = await uploadIfNeeded(coverImage)

        const { error } = await supabase.from('series').update({
          title,
          description,
          cover_image: uploadedCover,
          is_published: false
        }).eq('id', id)

        if (error) throw error

        // Cleanup old cover if it changed
        if (oldCover && oldCover !== uploadedCover) {
          deleteImagesFromUrls([oldCover]).catch(err => 
            console.error('[Store] Series cover cleanup failed:', err)
          )
        }

        set((state) => ({
          draftSeries: state.draftSeries.map(s =>
            s.id === id ? { ...s, title, description, coverImage: uploadedCover, isDirty: true, isPublished: false } : s
          ),
          isSyncing: false
        }))
      } catch (err: any) {
        set({ isSyncing: false })
        console.error('Error updating series:', err)
        toast.error(`更新失败: ${err.message}`)
      }
    },

    deleteSeries: async (id) => {
      set({ isSyncing: true })
      try {
        // Collect all images from the series and its products before deletion
        const targetSeries = get().draftSeries.find(s => s.id === id)
        const urlsToCleanup: string[] = []
        if (targetSeries) {
          if (targetSeries.coverImage) urlsToCleanup.push(targetSeries.coverImage)
          targetSeries.products.forEach(p => {
            if (p.images) urlsToCleanup.push(...p.images)
          })
        }

        const { error } = await supabase.from('series').delete().eq('id', id)
        if (error) throw error

        // 异步清理图片
        if (urlsToCleanup.length > 0) {
          deleteImagesFromUrls(urlsToCleanup).catch(err => 
            console.error('[Store] Series image cleanup failed:', err)
          )
        }

        set((state) => ({
          draftSeries: state.draftSeries.filter(s => s.id !== id),
          publishedSeries: state.publishedSeries.filter(s => s.id !== id),
          selectedSeriesId: state.selectedSeriesId === id ? null : state.selectedSeriesId,
          isSyncing: false
        }))
      } catch (err: any) {
        set({ isSyncing: false })
        console.error('Error deleting series:', err)
        toast.error(`删除失败: ${err.message}`)
      }
    },

    selectSeries: (id) => set({ selectedSeriesId: id }),

    addProduct: async (seriesId, title, description, images, layout) => {
      const state = get()
      if (!state.userId) return

      set({ isSyncing: true })
      try {
        console.log('[Store] Adding product to series:', seriesId)
        const id = crypto.randomUUID()
        const uploadedImages = await Promise.all(images.map(uploadIfNeeded))
        console.log('[Store] Images uploaded:', uploadedImages.length)

        // 1. 先更新系列为未发布状态
        await supabase.from('series').update({ is_published: false }).eq('id', seriesId)

        const currentProducts = state.draftSeries.find(s => s.id === seriesId)?.products || []
        const position = currentProducts.length

        const { error } = await supabase.from('products').insert({
          id,
          series_id: seriesId,
          user_id: state.userId,
          title,
          description,
          images: uploadedImages,
          layout,
          position
        })

        if (error) {
          console.error('[Store] Supabase insert error:', error)
          throw error
        }

        console.log('[Store] Product inserted to DB, ID:', id)

        const newProduct: Product = {
          id,
          title,
          description,
          images: uploadedImages,
          layout,
          seriesId,
          position,
          createdAt: new Date().toISOString()
        }

        set((state) => ({
          draftSeries: state.draftSeries.map(s =>
            s.id === seriesId
              ? { ...s, isDirty: true, isPublished: false, products: [...s.products, newProduct] }
              : s
          ),
          isSyncing: false
        }))
        console.log('[Store] Local state updated with new product')
        toast.success('产品添加成功')
      } catch (err: any) {
        console.error('[Store] Error in addProduct:', err)
        set({ isSyncing: false })
        toast.error(`添加产品失败: ${err.message}`)
      }
    },

    updateProduct: async (seriesId, productId, title, description, images, layout) => {
      set({ isSyncing: true })
      try {
        const series = get().draftSeries.find(s => s.id === seriesId)
        const oldProduct = series?.products.find(p => p.id === productId)
        const oldImages = oldProduct?.images || []

        const uploadedImages = await Promise.all(images.map(uploadIfNeeded))

        // 1. 先更新系列为未发布状态
        await supabase.from('series').update({ is_published: false }).eq('id', seriesId)

        // 2. 更新产品
        const { error } = await supabase.from('products').update({
          title,
          description,
          images: uploadedImages,
          layout
        }).eq('id', productId)

        if (error) throw error

        // 3. 清理不再需要的旧图片
        const abandonedImages = oldImages.filter(url => !uploadedImages.includes(url))
        if (abandonedImages.length > 0) {
          deleteImagesFromUrls(abandonedImages).catch(err => 
            console.error('[Store] Product images cleanup failed:', err)
          )
        }

        const existingProduct = get().draftSeries.find(s => s.id === seriesId)?.products.find(p => p.id === productId)
        const updatedProduct: Product = { 
          id: productId, 
          title, 
          description, 
          images: uploadedImages, 
          layout, 
          seriesId, 
          position: existingProduct?.position,
          createdAt: existingProduct?.createdAt || new Date().toISOString() 
        }

        set((state) => ({
          draftSeries: state.draftSeries.map(s =>
            s.id === seriesId
              ? {
                  ...s,
                  isDirty: true,
                  isPublished: false,
                  products: s.products.map(p => p.id === productId ? updatedProduct : p)
                }
              : s
          ),
          isSyncing: false
        }))
        toast.success('产品更新成功')
      } catch (err: any) {
        set({ isSyncing: false })
        console.error('Error updating product:', err)
        toast.error(`更新产品失败: ${err.message}`)
      }
    },

    deleteProduct: async (seriesId, productId) => {
      set({ isSyncing: true })
      try {
        // Get images to cleanup before deletion
        const series = get().draftSeries.find(s => s.id === seriesId)
        const product = series?.products.find(p => p.id === productId)
        const imagesToCleanup = product?.images || []

        // 1. 先更新系列为未发布状态
        await supabase.from('series').update({ is_published: false }).eq('id', seriesId)

        // 2. 删除产品
        const { error } = await supabase.from('products').delete().eq('id', productId)
        if (error) throw error

        // 3. 异步清理图片
        if (imagesToCleanup.length > 0) {
          deleteImagesFromUrls(imagesToCleanup).catch(err => 
            console.error('[Store] Product image cleanup failed:', err)
          )
        }

        set((state) => ({
          draftSeries: state.draftSeries.map(s =>
            s.id === seriesId
              ? { ...s, isDirty: true, isPublished: false, products: s.products.filter(p => p.id !== productId) }
              : s
          ),
          isSyncing: false
        }))
      } catch (err: any) {
        set({ isSyncing: false })
        console.error('Error deleting product:', err)
        toast.error(`删除产品失败: ${err.message}`)
      }
    },

    reorderProducts: async (seriesId, newProducts) => {
      // 1. 乐观更新本地状态
      set((state) => ({
        draftSeries: state.draftSeries.map(s =>
          s.id === seriesId ? { ...s, products: newProducts, isDirty: true, isPublished: false } : s
        )
      }))

      try {
        // 2. 先更新系列为未发布状态
        await supabase.from('series').update({ is_published: false }).eq('id', seriesId)

        // 3. 批量更新产品位置
        // 改用 update 以获得更好的 RLS 兼容性
        const updates = newProducts.map((p, index) => 
          supabase
            .from('products')
            .update({ position: index })
            .eq('id', p.id)
        )

        const results = await Promise.all(updates)
        const failedUpdate = results.find(r => r.error)
        
        if (failedUpdate && failedUpdate.error) {
          console.error('[Store] Reorder failed for a product:', failedUpdate.error)
          throw new Error(failedUpdate.error.message)
        }
      } catch (err: any) {
        console.error('Error reordering products:', err)
        toast.error(`排序保存失败: ${err.message || '请检查数据库权限'}`)
      }
    },

    updateBrand: async (brandUpdate) => {
      const state = get()
      const newBrand = { ...state.draftBrand, ...brandUpdate }

      // Update optimism
      set({
        draftBrand: newBrand,
        publishedBrand: newBrand, // Sync to published as well
        isBrandDirty: true
      })

      if (!state.userId) return

      // Keep isBrandDirty true during upload so UI can show loading if we wanted
      const [uploadedLogo, uploadedWechatQr, uploadedXhsQr] = await Promise.all([
        newBrand.logo ? uploadIfNeeded(newBrand.logo) : Promise.resolve(''),
        newBrand.authorWechatQr ? uploadIfNeeded(newBrand.authorWechatQr) : Promise.resolve(''),
        newBrand.authorXhsQr ? uploadIfNeeded(newBrand.authorXhsQr) : Promise.resolve('')
      ])
      
      newBrand.logo = uploadedLogo
      newBrand.authorWechatQr = uploadedWechatQr
      newBrand.authorXhsQr = uploadedXhsQr

      await supabase.from('brand_info').upsert({
        user_id: state.userId,
        name: newBrand.name,
        logo: newBrand.logo,
        description: newBrand.description,
        author_name: newBrand.authorName,
        author_bio: newBrand.authorBio,
        author_email: newBrand.authorEmail,
        author_wechat_id: newBrand.authorWechatId,
        author_wechat_qr: newBrand.authorWechatQr,
        author_xhs_id: newBrand.authorXhsId,
        author_xhs_qr: newBrand.authorXhsQr,
        author_custom_text: newBrand.authorCustomText,
        updated_at: new Date().toISOString()
      })

      set({
        draftBrand: newBrand,
        publishedBrand: newBrand,
        isBrandDirty: false
      })
    },

    publish: async (seriesId) => {
      const state = get()
      const username = state.username

      try {
        if (seriesId) {
          // 1. 调用 Server Action 执行服务端发布和缓存刷新
          const result = await publishSeriesAction(seriesId, username)

          if (!result.success) {
            throw new Error(result.message)
          }

          // 2. 成功后更新本地 Zustand 状态
          const now = result.lastPublished || new Date().toISOString()
          const targetSeries = state.draftSeries.find(s => s.id === seriesId)
          if (!targetSeries) return false

          const updatedSeries = { ...targetSeries, isDirty: false, isPublished: true, lastPublished: now }

          set({
            draftSeries: state.draftSeries.map(s => s.id === seriesId ? updatedSeries : s),
            publishedSeries: state.publishedSeries.some(s => s.id === seriesId)
              ? state.publishedSeries.map(s => s.id === seriesId ? JSON.parse(JSON.stringify(updatedSeries)) : s)
              : [...state.publishedSeries, JSON.parse(JSON.stringify(updatedSeries))]
          })

          return true
        } else {
          // 发布全部时也使用 Server Action
          // 我们需要先处理品牌信息的上传（这部分还在前端，因为涉及 file 处理）
          if (state.userId && state.isBrandDirty) {
            const [uploadedLogo, uploadedWechatQr, uploadedXhsQr] = await Promise.all([
              state.draftBrand.logo ? uploadIfNeeded(state.draftBrand.logo) : Promise.resolve(''),
              state.draftBrand.authorWechatQr ? uploadIfNeeded(state.draftBrand.authorWechatQr) : Promise.resolve(''),
              state.draftBrand.authorXhsQr ? uploadIfNeeded(state.draftBrand.authorXhsQr) : Promise.resolve('')
            ])

            await supabase.from('brand_info').upsert({
              user_id: state.userId,
              name: state.draftBrand.name,
              logo: uploadedLogo,
              description: state.draftBrand.description,
              author_name: state.draftBrand.authorName,
              author_bio: state.draftBrand.authorBio,
              author_email: state.draftBrand.authorEmail,
              author_wechat_id: state.draftBrand.authorWechatId,
              author_wechat_qr: uploadedWechatQr,
              author_xhs_id: state.draftBrand.authorXhsId,
              author_xhs_qr: uploadedXhsQr,
              author_custom_text: state.draftBrand.authorCustomText,
              updated_at: new Date().toISOString()
            })
          }

          const result = await publishAllAction(username)
          if (!result.success) throw new Error(result.message)

          const now = result.lastPublished || new Date().toISOString()
          const updatedDraftSeries = state.draftSeries.map(s => ({ ...s, isDirty: false, isPublished: true, lastPublished: now }))

          set({
            draftSeries: updatedDraftSeries,
            publishedSeries: JSON.parse(JSON.stringify(updatedDraftSeries)),
            publishedBrand: { ...state.draftBrand },
            isBrandDirty: false
          })

          return true
        }
      } catch (err: any) {
        console.error('Publish error:', err)
        toast.error(`发布失败: ${err.message || '未知错误'}`)
        return false
      }
    },

    unpublish: async (seriesId) => {
      try {
        const result = await unpublishSeriesAction(seriesId)
        if (!result.success) throw new Error(result.message)

        set((state) => ({
          draftSeries: state.draftSeries.map(s => 
            s.id === seriesId ? { ...s, isPublished: false, isDirty: true } : s
          ),
          publishedSeries: state.publishedSeries.filter(s => s.id !== seriesId)
        }))
        return true
      } catch (err: any) {
        toast.error(`取消发布失败: ${err.message}`)
        return false
      }
    },

    discardChanges: (seriesId) => set((state) => {
      if (seriesId) {
        const originalSeries = state.publishedSeries.find(s => s.id === seriesId)
        if (!originalSeries) {
          return {
            draftSeries: state.draftSeries.filter(s => s.id !== seriesId),
            selectedSeriesId: state.selectedSeriesId === seriesId ? null : state.selectedSeriesId
          }
        }
        return {
          draftSeries: state.draftSeries.map(s => s.id === seriesId ? JSON.parse(JSON.stringify(originalSeries)) : s)
        }
      } else {
        return {
          draftSeries: JSON.parse(JSON.stringify(state.publishedSeries)),
          draftBrand: { ...state.publishedBrand },
          isBrandDirty: false
        }
      }
    })
  }
})
