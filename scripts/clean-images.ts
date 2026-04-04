import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function scan() {
  console.log('正在从数据库收集图片引用...')
  const { data: brands } = await supabase.from('brand_info').select('logo, author_wechat_qr, author_xhs_qr')
  const { data: series } = await supabase.from('series').select('cover_image')
  const { data: products } = await supabase.from('products').select('images')

  const usedFiles = new Set<string>()
  const extractFileName = (url: string | null) => {
    if (!url) return
    const parts = url.split('/')
    const fileName = parts[parts.length - 1].split('?')[0]
    usedFiles.add(decodeURIComponent(fileName))
  }

  brands?.forEach(b => {
    extractFileName(b.logo)
    extractFileName(b.author_wechat_qr)
    extractFileName(b.author_xhs_qr)
  })
  series?.forEach(s => extractFileName(s.cover_image))
  products?.forEach(p => p.images?.forEach(extractFileName))

  console.log(`数据库引用了 ${usedFiles.size} 个文件。`)

  const { data: bucketFiles, error: listError } = await supabase.storage.from('craft-images').list('', { limit: 1000 })
  if (listError) throw listError

  const unusedFiles = bucketFiles
    .map(f => f.name)
    .filter(name => !usedFiles.has(name) && name !== '.emptyFolderPlaceholder')

  console.log(`发现 ${unusedFiles.length} 个未使用的文件：`)
  unusedFiles.forEach(f => console.log(` - ${f}`))
  
  return unusedFiles
}

scan().catch(console.error)
