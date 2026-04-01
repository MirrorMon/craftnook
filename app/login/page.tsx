'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Loader2, ArrowRight, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

export default function UnifiedAuthPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Clean username (allow underscores, numbers, letters)
    const cleanUsername = username.trim().replace(/[^a-zA-Z0-9_]/g, '')
    if (cleanUsername.length < 3) {
      toast.error('用户名至少 3 个字符')
      setIsLoading(false)
      return
    }

    const email = `${cleanUsername.toLowerCase()}@crafttool.local`

    try {
      // 1. Check if user exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', cleanUsername)
        .single()

      if (existingProfile) {
        // --- CASE: LOGIN ---
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) {
          toast.error('登录失败: 密码不正确或账号异常')
          setIsLoading(false)
          return
        }

        toast.success('欢迎回来！')
        window.location.href = '/admin'
      } else {
        // --- CASE: REGISTER ---
        if (password.length < 6) {
          toast.error('新账户密码至少 6 位')
          setIsLoading(false)
          return
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { username: cleanUsername }
          }
        })

        if (authError) {
          toast.error(`注册失败: ${authError.message}`)
          setIsLoading(false)
          return
        }

        if (authData.user) {
          // Create profile
          const { error: pErr } = await supabase
            .from('profiles')
            .insert([{ id: authData.user.id, username: cleanUsername }])
          
          if (pErr) throw pErr

          // Create default brand
          await supabase
            .from('brand_info')
            .insert([{ 
              user_id: authData.user.id, 
              name: `${cleanUsername} 的手作工坊`,
              description: '专注手工艺品创作，传承东方美学。',
              logo: ''
            }])
        }

        toast.success('账户创建成功！正在为您开启个人空间...')
        window.location.href = '/admin'
      }
    } catch (err: any) {
      console.error('Auth Error:', err)
      toast.error('处理请求时出错，请稍后重试')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-sm space-y-8 z-10">
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 mb-4 group hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
              <Sparkles className="text-primary-foreground" size={18} />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">CraftTool</span>
          </Link>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">开启您的创作空间</h1>
          <p className="text-muted-foreground text-sm">
            输入用户名和密码。系统将为您自动登录或创建新账号。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 md:p-8 rounded-2xl border border-border shadow-xl shadow-primary/5">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="例如: Admin_1"
                required
                disabled={isLoading}
                className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                required
                disabled={isLoading}
                className="flex h-11 w-full rounded-xl border border-input bg-background/50 px-4 py-2 text-sm ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-primary px-6 font-medium text-primary-foreground shadow-lg transition-all hover:bg-primary/90active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <div className="flex items-center gap-2">
                <span>进入工作台</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </div>
            )}
          </button>

          <p className="text-center text-[12px] text-muted-foreground leading-relaxed">
            新用户名将自动注册。已注册用户请凭密码登入。<br />
            密码至少 6 位，支持字母及数字。
          </p>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} CraftTool. 用心记录手工的温度.
        </p>
      </div>
    </div>
  )
}
