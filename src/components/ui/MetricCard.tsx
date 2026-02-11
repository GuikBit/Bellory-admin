import { type ReactNode } from 'react'
import { cn } from '../../utils/cn'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  trend?: {
    value: number
    label?: string
  }
  className?: string
  iconBg?: string
}

export function MetricCard({ title, value, subtitle, icon, trend, className, iconBg }: MetricCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715]/95 dark:backdrop-blur-md p-5 transition-all duration-200 hover:shadow-md',
      className
    )}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">
          {title}
        </span>
        {icon && (
          <div className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg',
            iconBg || 'bg-[#db6f57]/10 text-[#db6f57] dark:bg-[#E07A62]/10 dark:text-[#E07A62]'
          )}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB] mb-1">
        {value}
      </div>
      <div className="flex items-center gap-2">
        {trend && (
          <span className={cn(
            'inline-flex items-center gap-1 text-xs font-medium',
            trend.value >= 0 ? 'text-[#4f6f64] dark:text-[#6B8F82]' : 'text-red-500'
          )}>
            {trend.value >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {trend.value >= 0 ? '+' : ''}{trend.value.toFixed(1)}%
          </span>
        )}
        {subtitle && (
          <span className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{subtitle}</span>
        )}
      </div>
    </div>
  )
}
