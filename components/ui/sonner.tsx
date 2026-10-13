'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          // 提示色跟随品牌规范：错误=#C65035，成功=#54A844（10% 浅底 + 原色文字/描边）
          '--error-bg': '#F9EDEB',
          '--error-text': '#C65035',
          '--error-border': '#EECAC2',
          '--success-bg': '#EEF6EC',
          '--success-text': '#54A844',
          '--success-border': '#CBE5C7',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
