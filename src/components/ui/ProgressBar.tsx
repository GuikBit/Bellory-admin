import { cn } from '../../utils/cn'

interface ProgressBarProps {
  value: number
  max: number
  label?: string
  showValues?: boolean
  className?: string
  color?: 'primary' | 'success' | 'warning' | 'danger'
}

const colorStyles = {
  primary: 'bg-[#db6f57] dark:bg-[#E07A62]',
  success: 'bg-[#4f6f64] dark:bg-[#6B8F82]',
  warning: 'bg-amber-500',
  danger: 'bg-red-500',
}

export function ProgressBar({ value, max, label, showValues = true, className, color = 'primary' }: ProgressBarProps) {
  const percent = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const autoColor = percent >= 90 ? 'danger' : percent >= 70 ? 'warning' : color

  return (
    <div className={cn('w-full', className)}>
      {(label || showValues) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4]">{label}</span>}
          {showValues && (
            <span className="text-xs text-[#6b5d57] dark:text-[#7A716A]">
              {value.toLocaleString('pt-BR')} / {max.toLocaleString('pt-BR')}
            </span>
          )}
        </div>
      )}
      <div className="h-2 rounded-full bg-[#d8ccc4]/30 dark:bg-[#2D2925] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', colorStyles[autoColor])}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
