import Link from 'next/link'
import { LayoutGrid, List, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const revalidate = 0 // Disable cache for now to ensure fresh data
export const dynamic = 'force-dynamic'

export default async function UserHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ username: string }>
  searchParams: Promise<{ view?: string }>
}) {
  const { username } = await params
  const resolvedSearchParams = await searchParams
  const viewMode = resolvedSearchParams.view === 'list' ? 'list' : 'grid'
  const supabase = await createClient()

  // Find the exact user_id based on username
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username')
    .ilike('username', username)
    .single()

  // If user doesn't exist, return 404
  if (!profile) {
    notFound()
  }

  const userId = profile.id

  // Fetch only this user's published series
  const { data: seriesData } = await supabase
    .from('series')
    .select('*, products(id)')
    .eq('user_id', userId)
    .eq('is_published', true)
    .order('last_published_at', { ascending: false })

  // Fetch this user's brand
  const { data: brandData } = await supabase
    .from('brand_info')
    .select('*')
    .eq('user_id', userId)
    .single()

  let brand = {
    name: brandData?.name || `${profile.username} 的手作工坊`,
    description: brandData?.description || '专注手工艺品创作，传承东方美学。',
    logo: brandData?.logo || ''
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-start gap-8">
            {brand.logo ? (
              <div className="w-24 h-24 flex-shrink-0 rounded overflow-hidden flex items-center justify-center">
                <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className="w-24 h-24 flex-shrink-0 bg-secondary rounded flex items-center justify-center">
                <span className="text-4xl font-semibold text-foreground uppercase">
                  {brand.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0 pt-1">
              <h1 className="text-4xl font-semibold tracking-tight text-foreground">
                {brand.name}
              </h1>
              <p className="text-muted-foreground mt-4 text-lg leading-relaxed line-clamp-2">
                {brand.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-medium text-foreground">全部发布作品</h2>
          <div className="flex items-center gap-1 bg-[#F7F8F8] border border-border rounded-[4px] p-1">
            <Link
              href={`?view=grid`}
              className={`p-2 rounded-[4px] transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LayoutGrid size={18} />
            </Link>
            <Link
              href={`?view=list`}
              className={`p-2 rounded-[4px] transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List size={18} />
            </Link>
          </div>


        </div>

        {!seriesData || seriesData.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-muted-foreground text-lg">暂无公开产品系列</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {seriesData.map((s) => (
              <SeriesCard key={s.id} series={s} username={profile.username} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {seriesData.map((s) => (
              <SeriesListItem key={s.id} series={s} username={profile.username} />
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-24">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} {brand.name}</p>
          <p>Powered by CraftTool</p>
        </div>
      </footer>
    </div>
  )
}

function SeriesCard({ series, username }: { series: any, username: string }) {
  const productCount = series.products ? series.products.length : 0
  return (
    <Link href={`/series/${series.id}`} className="group block">
      <div className="aspect-[4/5] rounded overflow-hidden bg-muted mb-4">
        {series.cover_image ? (
          <img 
            src={series.cover_image} 
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <LayoutGrid size={32} />
          </div>
        )}
      </div>
      <h3 className="text-xl font-medium text-foreground group-hover:text-accent transition-colors">
        {series.title}
      </h3>
      {series.description && (
        <p className="text-muted-foreground mt-1 line-clamp-2">{series.description}</p>
      )}
      <p className="text-sm text-muted-foreground mt-2">{productCount} 件作品</p>
    </Link>
  )
}

function SeriesListItem({ series, username }: { series: any, username: string }) {
  const productCount = series.products ? series.products.length : 0
  return (
    <Link 
      href={`/series/${series.id}`} 
      className="group flex gap-6 p-6 bg-[#F7F8F8] rounded-[4px] hover:shadow-lg transition-shadow"
    >

      <div className="w-32 h-32 flex-shrink-0 rounded overflow-hidden bg-muted">
        {series.cover_image ? (
          <img 
            src={series.cover_image} 
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <LayoutGrid size={24} />
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center">
        <h3 className="text-xl font-medium text-foreground group-hover:text-accent transition-colors">
          {series.title}
        </h3>
        {series.description && (
          <p className="text-muted-foreground mt-2 line-clamp-2">{series.description}</p>
        )}
        <p className="text-sm text-muted-foreground mt-3">{productCount} 件作品</p>
      </div>
    </Link>
  )
}
