import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../../utils/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB] mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b5d57] dark:text-[#7A716A]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full h-10 px-3 rounded-lg border bg-white text-[#2a2420] placeholder:text-[#6b5d57]/50 transition-colors',
              'border-[#d8ccc4] focus:border-[#db6f57] focus:ring-2 focus:ring-[#db6f57]/20 focus:outline-none',
              'dark:bg-[#1A1715] dark:text-[#F5F0EB] dark:border-[#2D2925] dark:placeholder:text-[#7A716A] dark:focus:border-[#E07A62] dark:focus:ring-[#E07A62]/20',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b5d57] dark:text-[#7A716A]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
export { Input }
