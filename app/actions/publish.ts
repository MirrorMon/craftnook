'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

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
    // 2. 更新数据库
    const { error: sErr, count } = await supabase
      .from('series')
      .update({ 
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
    
    // 3. 强制清除对应前台路由的缓存
    // 在 Next.js 15 中，revalidatePath 是最直接的缓存失效手段
    // 强制全局刷新根布局，确保导航栏、侧边栏和所有子路径刷新
    revalidatePath('/', 'layout')
    
    return { success: true, lastPublished: now }
  } catch (err: any) {
    console.error('Server Action Error:', err)
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
