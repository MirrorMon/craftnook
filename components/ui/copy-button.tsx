'use client'

import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface CopyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  label?: string
}

export function CopyButton({
  value,
  label,
  className,
  ...props
}: CopyButtonProps) {
  const [hasCopied, setHasCopied] = React.useState(false)

  React.useEffect(() => {
    if (hasCopied) {
      const timer = setTimeout(() => {
        setHasCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [hasCopied])

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        "relative z-10 h-6 w-6 text-zinc-500 hover:bg-zinc-700 hover:text-zinc-50",
        className
      )}
      onClick={() => {
        navigator.clipboard.writeText(value)
        setHasCopied(true)
        toast.success(label ? `已复制 ${label}` : "已复制到剪贴板")
      }}
      {...props}
    >
      <span className="sr-only">Copy</span>
      {hasCopied ? (
        <Check className="h-3 w-3" />
      ) : (
        <Copy className="h-3 w-3" />
      )}
    </Button>
  )
}
