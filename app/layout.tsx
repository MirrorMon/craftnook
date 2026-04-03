import type { Metadata } from 'next'
import { Cormorant_Garamond } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-serif"
});

export const metadata: Metadata = {
  title: '手作工坊 | Handcraft Studio',
  description: '精选手工艺品展示',
  generator: 'v0.app',
  icons: {
    icon: '/CraftNook_logo_tab.png',
    apple: '/CraftNook_logo_tab.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${cormorant.variable} font-serif antialiased overflow-x-hidden w-full`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
