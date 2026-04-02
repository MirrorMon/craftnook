'use client'

import { useState, useEffect } from 'react'
import { SeriesList } from '@/components/admin/series-list'
import { ProductGrid } from '@/components/admin/product-grid'
import { BrandSettingsModal } from '@/components/admin/brand-settings-modal'
import { useStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ExternalLink, Settings2, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function AdminPage() {
  const { draftBrand, username, isBrandDirty, isInitialized, initStore } = useStore()
  const [showBrandModal, setShowBrandModal] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  useEffect(() => {
    initStore()
  }, [initStore])

  if (!isInitialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center text-muted-foreground gap-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p>加载工作台数据...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="h-16 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {draftBrand.logo ? (
              <img 
                src={draftBrand.logo} 
                alt={draftBrand.name}
                className="w-10 h-10 object-contain rounded"
              />
            ) : (
              <div className="w-10 h-10 bg-secondary rounded flex items-center justify-center">
                <span className="text-lg font-semibold text-foreground">
                  {draftBrand.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-foreground">{draftBrand.name}</h1>
                <button
                  onClick={() => setShowBrandModal(true)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-all group relative mt-0.5"
                >
                  <Settings2 size={18} />
                  <span className="absolute left-1/2 -translate-x-1/2 top-full mt-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 whitespace-nowrap pointer-events-none before:content-[''] before:absolute before:bottom-full before:left-1/2 before:-translate-x-1/2 before:border-4 before:border-transparent before:border-b-gray-900 shadow-xl z-50">
                    品牌设置
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href={username ? `/${username}` : "/"} 
              target="_blank"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              <ExternalLink size={16} />
              <span>查看前台</span>
            </Link>

            <div className="h-4 w-[1px] bg-border" /> {/* Separator */}

            <div className="relative group">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent hover:border-border hover:bg-secondary/50 transition-all cursor-pointer">
                <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-primary/10">
                  {username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">{username}</span>
              </div>
              
              <div className="absolute right-0 top-full pt-2 opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-200 z-50">
                <div className="bg-white border border-border shadow-xl rounded-md overflow-hidden min-w-[140px] p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-md transition-colors font-medium"
                  >
                    <LogOut size={16} />
                    退出登录
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <SeriesList />
        <ProductGrid />
        
        {/* Discreet Version Info */}
        <div className="absolute bottom-2 right-4 pointer-events-none">
          <span className="text-[10px] font-mono text-muted-foreground/20">v0.2</span>
        </div>
      </div>

      {/* Brand Settings Modal */}
      <BrandSettingsModal 
        isOpen={showBrandModal} 
        onClose={() => setShowBrandModal(false)} 
      />
    </div>
  )
}
