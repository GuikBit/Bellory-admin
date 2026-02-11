import { cn } from '../../utils/cn'

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-[#d8ccc4]/40 dark:bg-[#2D2925]',
        className
      )}
    />
  )
}

export function MetricCardSkeleton() {
  return (
    <div className="rounded-xl border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715]/95 p-6">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-10 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-20 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="rounded-xl border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715]/95 p-6">
      <Skeleton className="h-5 w-40 mb-6" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )
}
