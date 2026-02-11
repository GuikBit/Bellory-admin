import { cn } from '../../utils/cn'

interface StatusIndicatorProps {
  status: 'connected' | 'disconnected' | 'active' | 'inactive' | 'pending'
  label?: string
  size?: 'sm' | 'md'
}

const statusConfig = {
  connected: { color: 'bg-emerald-500', label: 'Conectada' },
  disconnected: { color: 'bg-red-500', label: 'Desconectada' },
  active: { color: 'bg-emerald-500', label: 'Ativo' },
  inactive: { color: 'bg-gray-400 dark:bg-gray-600', label: 'Inativo' },
  pending: { color: 'bg-amber-500', label: 'Pendente' },
}

export function StatusIndicator({ status, label, size = 'md' }: StatusIndicatorProps) {
  const config = statusConfig[status]

  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        'rounded-full',
        config.color,
        size === 'sm' ? 'h-2 w-2' : 'h-2.5 w-2.5',
        (status === 'connected' || status === 'active') && 'animate-pulse'
      )} />
      <span className={cn(
        'text-[#2a2420] dark:text-[#F5F0EB]',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}>
        {label || config.label}
      </span>
    </div>
  )
}
