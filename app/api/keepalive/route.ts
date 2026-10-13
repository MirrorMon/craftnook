import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 定时任务必须每次真实执行，不能被静态化/缓存
export const dynamic = 'force-dynamic'

/**
 * 保活接口（免费版 Supabase 专用）
 *
 * Supabase 免费版项目如果连续 7 天没有"用户数据库活动"会被自动暂停。
 * Vercel Cron 每天调用这个接口两次（见 vercel.json），每次都对数据库
 * 发几条真实的查询，让项目保持"活跃"状态。
 *
 * 这个接口不返回任何业务数据，只返回查询是否成功。
 */
export async function GET(request: NextRequest) {
  // 可选加固：如果 Vercel 环境变量里配了 CRON_SECRET，
  // 则只允许带正确令牌的调用（Vercel Cron 会自动带上）。
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  // 优先用 service role key（绕过 RLS，查询必然真实执行）；
  // 没有配置时用 anon key 兜底，同样能产生数据库活动。
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return NextResponse.json({ error: 'Supabase 环境变量缺失' }, { status: 500 })
  }

  const supabase = createClient(url, key, { auth: { persistSession: false } })

  // 对每张表做一次 COUNT 查询：在 Postgres 里真实执行，但不返回任何行。
  // 查多张表是为了容错——将来某张表改名/删掉，其余查询仍然算活动。
  // 用 '*' 而不是具体列名，避免某张表没有 id 列时查失败。
  const tables = ['series', 'products', 'profiles', 'brand_info']

  const checks = await Promise.all(
    tables.map(async (table) => {
      const { error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      return { table, ok: !error }
    })
  )

  const ok = checks.some((check) => check.ok)
  const failed = checks.filter((check) => !check.ok).map((check) => check.table)

  console.log(
    `[keepalive] ${new Date().toISOString()} ok=${ok}` +
      (failed.length ? ` failed_tables=${failed.join(',')}` : '')
  )

  return NextResponse.json({ ok, failed }, { status: ok ? 200 : 500 })
}
