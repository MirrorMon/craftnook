import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { InquiryWidget } from '@/components/series/inquiry-widget'
import { ProductDisplay } from '@/components/series/product-display'

export const revalidate = 0

export default async function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch the series details with owner profile
  const { data: currentSeries } = await supabase
    .from('series')
    .select('*, products(*), profiles(id, username)')
    .eq('id', id)
    .order('position', { foreignTable: 'products', ascending: true })
    .single()
  
  if (!currentSeries || (!currentSeries.is_published && typeof window === 'undefined')) {
    // Note: in a real production app we'd want to auth check if the user is the owner to see drafts.
    // For now we assume if it's hit on the frontend by a public user, they must only see published.
    // But since RLS is in place, if is_published is false and they aren't the owner, query returns null.
    
    // If we did get data back but it's null
    if (!currentSeries) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-lg mb-4">系列不存在或尚未发布</p>
            <Link href="/" className="text-accent hover:underline">返回首页</Link>
          </div>
        </div>
      )
    }
  }

  // Fetch brand/author info
  const { data: brandData } = await supabase
    .from('brand_info')
    .select('*')
    .eq('user_id', currentSeries.user_id)
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
    name: currentSeries.profiles?.username || '手作工坊',
    logo: '',
    description: '',
    authorName: currentSeries.profiles?.username || '匠人',
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
            href={currentSeries.profiles?.username ? `/${currentSeries.profiles.username}` : "/"}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft size={18} />
            返回个人主页
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end gap-6">
            {currentSeries.cover_image && (
              <div className="w-24 h-24 rounded overflow-hidden flex-shrink-0">
                <img 
                  src={currentSeries.cover_image} 
                  alt={currentSeries.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {currentSeries.title}
              </h1>
              {currentSeries.description && (
                <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
                  {currentSeries.description}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Products */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {!currentSeries.products || currentSeries.products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">该系列暂无产品</p>
          </div>
        ) : (
          <div className="flex flex-col gap-20">
            {currentSeries.products.map((product: any, index: number) => (
              <ProductDisplay key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </main>

      <InquiryWidget seriesTitle={currentSeries.title} brand={brand} />
    </div>
  )
}
