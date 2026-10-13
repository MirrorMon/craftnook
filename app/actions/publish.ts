'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { PublishedSnapshot } from '@/lib/types'

function buildSnapshot(series: any, products: any[]): PublishedSnapshot {
  return {
    title: series.title,
    description: series.description || '',
    cover_image: series.cover_image || '',
    products: (products || []).map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description || '',
      images: p.images || [],
      layout: p.layout,
      position: typeof p.position === 'number' ? p.position : null
    }))
  }
}

/**
 * 找出"旧快照里有、但当前工作副本里已不再使用"的图片。
 * 编辑期间不删图片；发布成功后再由前端调用 deleteImagesFromUrls 清理，
 * 避免前台还在展示的旧版本出现裂图。
 */
function computeStaleImages(oldSnapshot: PublishedSnapshot | null, series: any, products: any[]): string[] {
  if (!oldSnapshot) return []
  const oldUrls = new Set<string>()
  if (oldSnapshot.cover_image) oldUrls.add(oldSnapshot.cover_image)
  ;(oldSnapshot.products || []).forEach((p) => (p.images || []).forEach((u) => oldUrls.add(u)))

  const keptUrls = new Set<string>()
  if (series.cover_image) keptUrls.add(series.cover_image)
  ;(products || []).forEach((p) => ((p.images || []) as string[]).forEach((u) => keptUrls.add(u)))

  return Array.from(oldUrls).filter((u) => !keptUrls.has(u))
}

export async function publishSeriesAction(seriesId: string, username: string | null) {
  const supabase = await createClient()
  
  // 1. 获取当前登录用户
  const { data: { user }, error: uErr } = await supabase.auth.getUser()
  if (uErr || !user) {
    console.error('Auth error in action:', uErr)
    return { success: false, message: '未授权或登录过期' }
  }
  
  const now = new Date().toISOString()
  
  try {
    // 2. 读取当前"工作副本"（系列 + 产品）
    const { data: series, error: sReadErr } = await supabase
      .from('series')
      .select('*')
      .eq('id', seriesId)
      .eq('user_id', user.id)
      .single()
    
    if (sReadErr || !series) {
      return { success: false, message: '未找到该系列或无权修改（可能 ID 已失效，请刷新页面）' }
    }

    const { data: products, error: pErr } = await supabase
      .from('products')
      .select('*')
      .eq('series_id', seriesId)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })

    if (pErr) throw pErr

    // 3. 构建新快照，并计算需要清理的旧图片
    const snapshot = buildSnapshot(series, products || [])
    const staleImages = computeStaleImages(
      (series as any).published_snapshot as PublishedSnapshot | null,
      series,
      products || []
    )

    // 4. 发布 = 用工作副本重建快照 + 上线
    const { error: sErr, count } = await supabase
      .from('series')
      .update({ 
        published_snapshot: snapshot as any,
        has_unpublished_changes: false,
        is_published: true, 
        last_published_at: now 
      }, { count: 'exact' })
      .eq('id', seriesId)
      .eq('user_id', user.id) // 权限双重检查
    
    if (sErr) throw sErr

    if (count === 0) {
      console.warn(`Publish failed: No series found with ID ${seriesId} for user ${user.id}`)
      return { success: false, message: '未找到该系列或无权修改（可能 ID 已失效，请刷新页面）' }
    }
    
    // 5. 强制清除对应前台路由的缓存
    revalidatePath('/', 'layout')
    
    return { success: true, lastPublished: now, staleImages }
  } catch (err: any) {
    console.error('Server Action Error:', err)
    return { success: false, message: err.message || '服务器内部错误' }
  }
}

/**
 * 放弃未发布的修改：用快照覆盖"工作副本"（系列字段 + 产品集合/顺序）。
 * 仅对"存在快照"的系列有效。可重复执行（幂等）。
 */
export async function restoreSeriesFromSnapshotAction(seriesId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '未授权' }

  try {
    const { data: series, error } = await supabase
      .from('series')
      .select('*')
      .eq('id', seriesId)
      .eq('user_id', user.id)
      .single()

    if (error || !series) return { success: false, message: '未找到该系列' }

    const snapshot = (series as any).published_snapshot as PublishedSnapshot | null
    if (!snapshot) return { success: false, message: '该系列没有已发布版本，无法还原' }

    // 1. 还原系列字段
    const { error: sErr } = await supabase
      .from('series')
      .update({
        title: snapshot.title,
        description: snapshot.description,
        cover_image: snapshot.cover_image,
        has_unpublished_changes: false
      })
      .eq('id', seriesId)
      .eq('user_id', user.id)

    if (sErr) throw sErr

    // 2. 还原产品：先清空，再按快照重建（保留原 id 与顺序）
    const { error: dErr } = await supabase
      .from('products')
      .delete()
      .eq('series_id', seriesId)

    if (dErr) throw dErr

    const rows = (snapshot.products || []).map((p, index) => ({
      id: p.id,
      series_id: seriesId,
      user_id: user.id,
      title: p.title,
      description: p.description,
      images: p.images || [],
      layout: p.layout,
      position: typeof p.position === 'number' ? p.position : index
    }))

    if (rows.length > 0) {
      const { error: iErr } = await supabase.from('products').insert(rows)
      if (iErr) throw iErr
    }

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    console.error('Restore Action Error:', err)
    return { success: false, message: err.message || '服务器内部错误' }
  }
}

export async function publishAllAction(username: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '未授权' }
  
  const now = new Date().toISOString()
  
  try {
    // 批量发布所有系列
    const { error: sErr } = await supabase
      .from('series')
      .update({ is_published: true, last_published_at: now })
      .eq('user_id', user.id)
    
    if (sErr) throw sErr
    
    if (username) {
      revalidatePath(`/${username}`)
    }
    
    return { success: true, lastPublished: now }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}

export async function unpublishSeriesAction(seriesId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: '未授权' }

  try {
    const { error } = await supabase
      .from('series')
      .update({ is_published: false })
      .eq('id', seriesId)
      .eq('user_id', user.id)

    if (error) throw error

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}
