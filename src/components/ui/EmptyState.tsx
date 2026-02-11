import { type ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-[#d8ccc4] dark:text-[#2D2925] mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-[#2a2420] dark:text-[#F5F0EB] mb-2">{title}</h3>
      <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4] text-center max-w-md mb-6">{description}</p>
      {action}
    </div>
  )
}
