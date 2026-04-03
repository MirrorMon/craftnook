import Link from 'next/link'
import { LayoutGrid, Sparkles, Zap, Shield, ArrowRight, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let username = ''
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', user.id)
      .single()
    username = profile?.username || '管理员'
  }
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/CraftNook_logo_Vertical.png"
              alt="CraftNook Logo"
              className="h-8 object-contain"
            />
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-transparent hover:border-border hover:bg-secondary/50 transition-all"
              >
                <div className="w-7 h-7 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-primary/10">
                  {username?.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-foreground">{username}</span>
              </Link>
            ) : null}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 overflow-hidden">
        <section className="relative min-h-[80vh] flex items-center justify-center py-24 px-6">
          {/* 1. Background Decoration (Bottom Flowers) - Absolute strictly fixed size, center crop */}
          <div className="absolute bottom-0 left-0 w-full h-[380px] overflow-hidden flex items-end justify-center pointer-events-none z-0 select-none" aria-hidden="true">
            <img
              src="/images/hero/bottom-flowers.png"
              alt=""
              className="w-[800px] h-[380px] max-w-none flex-none opacity-80"
            />
          </div>

          {/* 2. Decorative Hands Cluster - Locked to max 1232px and Centered */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-full max-w-[1232px] pointer-events-none z-0 select-none" aria-hidden="true">
            {/* Left Hand - Hidden < 1024px (lg), strictly 600px height >= 1024px */}
            <div className="absolute left-0 bottom-0 w-[275px] h-[600px] hidden lg:block animate-fade-in-up">
              <img
                src="/images/hero/hand-left.png"
                alt=""
                className="w-full h-full object-none object-left-bottom opacity-90"
              />
            </div>

            {/* Right Hand - Hidden < 1024px (lg), strictly 600px height >= 1024px */}
            <div className="absolute right-0 bottom-0 w-[270px] h-[600px] hidden lg:block animate-fade-in-up">
              <img
                src="/images/hero/hand-right.png"
                alt=""
                className="w-full h-full object-none object-right-bottom opacity-90"
              />
            </div>
          </div>

          {/* 3. Main Content Layer */}
          <div className="relative z-10 max-w-4xl mx-auto w-full text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/80 backdrop-blur-sm text-secondary-foreground text-xs font-medium animate-fade-in">
              <Zap size={14} className="text-yellow-500" />
              <span>专为独立手作人打造的展示平台</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] drop-shadow-sm">
              让您的手作作品<br />
              像艺术杂志一样精美
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              无需设计经验，只需上传图片，为您的每一个系列作品提供沉浸式的、极具设计感的在线展示空间
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href={user ? "/admin" : "/login"}
                className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-md font-semibold text-lg hover:bg-primary/90 transition-all shadow-xl flex items-center justify-center gap-2 group"
              >
                立即开始创建
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 bg-card border-y border-border">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                  <LayoutGrid size={24} />
                </div>
                <h3 className="text-xl font-bold">极简排版系统</h3>
                <p className="text-muted-foreground leading-relaxed">
                  提供大图、双列、画廊等多种杂志质感的排版方式，让您的作品展示不再千篇一律
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold">专属艺术家门户</h3>
                <p className="text-muted-foreground leading-relaxed">
                  拥有专属个人网址，个人主页就是你的线上名片
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center text-primary">
                  <Shield size={24} />
                </div>
                <h3 className="text-xl font-bold">安全可靠的云端存储</h3>
                <p className="text-muted-foreground leading-relaxed">
                  基于 Supabase 驱动，作品数据永久保存，即便在手机上也能随时管理您的展示页面
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">准备好展示您的才华了吗？</h2>
            <p className="text-muted-foreground text-lg">
              加入 CraftNook，与其他手作人一起，构建属于您的美学空间
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-8 py-3 bg-foreground text-background rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              免费注册账号
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-muted rounded flex items-center justify-center">
              <img
                src="/CraftNook_logo.png"
                alt="CraftNook Logo"
                className="h-[14px] object-contain"
              />
            </div>
            <span className="font-semibold text-muted-foreground">CraftNook</span>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-3">
            <span>© {new Date().getFullYear()} CraftNook. 用心记录每一份手工的温度</span>
            <span className="opacity-30 font-mono text-[10px]">v0.2.2</span>
          </p>
        </div>
      </footer>
    </div>
  )
}
