import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { InquiryWidget } from '@/components/series/inquiry-widget'
import { ProductDisplay } from '@/components/series/product-display'

export const revalidate = 0

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // 前台只展示"已发布快照"：行必须在线（is_published）且存在快照；
  // 对所有人（包括作者本人）行为一致，编辑中的内容不会出现在前台。
  const { data: seriesRow } = await supabase
    .from('series')
    .select('id, user_id, is_published, published_snapshot, profiles(id, username)')
    .eq('id', id)
    .single()

  const snapshot: any = (seriesRow as any)?.published_snapshot

  if (!seriesRow || !seriesRow.is_published || !snapshot) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg mb-4">系列不存在或尚未发布</p>
          <Link href="/" className="text-accent hover:underline">返回首页</Link>
        </div>
      </div>
    )
  }

  const snapshotProducts: any[] = Array.isArray(snapshot.products) ? snapshot.products : []

  // Fetch brand/author info
  const { data: brandData } = await supabase
    .from('brand_info')
    .select('*')
    .eq('user_id', (seriesRow as any).user_id)
    .single()

  const brand = brandData ? {
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
  } : {
    name: (seriesRow as any).profiles?.username || '手作工坊',
    logo: '',
    description: '',
    authorName: (seriesRow as any).profiles?.username || '匠人',
    authorBio: '',
    authorEmail: '',
    authorWechatId: '',
    authorWechatQr: '',
    authorXhsId: '',
    authorXhsQr: '',
    authorCustomText: ''
  }
  
  return (
    <div className="min-h-screen bg-white pb-24 overflow-x-hidden w-full relative">
      {/* Header */}
      <header className="border-b border-border w-full">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link 
            href={(seriesRow as any).profiles?.username ? `/${(seriesRow as any).profiles.username}` : "/"}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            返回个人主页
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {snapshot.cover_image && (
              <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={snapshot.cover_image} 
                  alt={snapshot.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {snapshot.title}
              </h1>
              {snapshot.description && (
                <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
                  {snapshot.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {snapshotProducts.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">该系列暂无产品</p>
          </div>
        ) : (
          <div className="flex flex-col gap-20">
            {snapshotProducts.map((product: any, index: number) => (
              <ProductDisplay
                key={product.id || index}
                product={{
                  id: product.id,
                  title: product.title,
                  description: product.description || '',
                  images: product.images || [],
                  layout: (product.layout || 'large') as 'large' | 'double' | 'gallery'
                }}
                index={index}
              />
            ))}
          </div>
        )}
      </main>

      <InquiryWidget seriesTitle={snapshot.title} brand={brand} />
    </div>
  )
}
