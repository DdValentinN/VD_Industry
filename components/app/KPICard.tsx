import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface KPICardProps {
  title: string
  value: string
  icon: LucideIcon
  valueClassName?: string
  className?: string
}

export function KPICard({ title, value, icon: Icon, valueClassName, className }: KPICardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-white/10 bg-[#111] p-5 flex flex-col gap-3 hover:border-white/20 transition-colors',
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate pr-2">
          {title}
        </p>
        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-gray-400" />
        </div>
      </div>
      <p className={cn('text-2xl font-bold text-white', valueClassName)}>{value}</p>
    </div>
  )
}
