import { type HTMLAttributes } from 'react'
import { cn } from '../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-white border-[#d8ccc4] dark:bg-[#1A1715]/95 dark:border-[#2D2925] dark:backdrop-blur-md',
        hover && 'transition-all duration-200 hover:shadow-lg hover:border-[#db6f57]/30 dark:hover:border-[#E07A62]/30',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-6 py-4 border-b border-[#d8ccc4] dark:border-[#2D2925]', className)} {...props}>
      {children}
    </div>
  )
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  )
}
