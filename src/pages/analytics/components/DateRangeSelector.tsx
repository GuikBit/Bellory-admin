import { useState } from 'react'
import { cn } from '../../../utils/cn'

interface DateRangeSelectorProps {
  startDate: string
  endDate: string
  onChange: (start: string, end: string) => void
}

type Preset = 'today' | '7d' | '30d' | 'this-month' | 'last-month' | 'custom'

function toISO(date: Date): string {
  return date.toISOString().split('T')[0]
}

function getPresetDates(preset: Exclude<Preset, 'custom'>): [string, string] {
  const today = new Date()
  switch (preset) {
    case 'today':
      return [toISO(today), toISO(today)]
    case '7d': {
      const d = new Date(today)
      d.setDate(d.getDate() - 7)
      return [toISO(d), toISO(today)]
    }
    case '30d': {
      const d = new Date(today)
      d.setDate(d.getDate() - 30)
      return [toISO(d), toISO(today)]
    }
    case 'this-month': {
      const first = new Date(today.getFullYear(), today.getMonth(), 1)
      return [toISO(first), toISO(today)]
    }
    case 'last-month': {
      const first = new Date(today.getFullYear(), today.getMonth() - 1, 1)
      const last = new Date(today.getFullYear(), today.getMonth(), 0)
      return [toISO(first), toISO(last)]
    }
  }
}

const presets: { key: Exclude<Preset, 'custom'>; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: '7d', label: '7 dias' },
  { key: '30d', label: '30 dias' },
  { key: 'this-month', label: 'Este mês' },
  { key: 'last-month', label: 'Mês passado' },
]

export function DateRangeSelector({ startDate, endDate, onChange }: DateRangeSelectorProps) {
  const [activePreset, setActivePreset] = useState<Preset>('30d')

  function handlePreset(preset: Exclude<Preset, 'custom'>) {
    setActivePreset(preset)
    const [start, end] = getPresetDates(preset)
    onChange(start, end)
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {presets.map((p) => (
        <button
          key={p.key}
          onClick={() => handlePreset(p.key)}
          className={cn(
            'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
            activePreset === p.key
              ? 'bg-[#db6f57] text-white dark:bg-[#E07A62]'
              : 'bg-[#faf8f6] text-[#6b5d57] hover:bg-[#f0ebe6] dark:bg-[#2D2925] dark:text-[#B8AEA4] dark:hover:bg-[#3D3530]'
          )}
        >
          {p.label}
        </button>
      ))}
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={startDate}
          onChange={(e) => {
            setActivePreset('custom')
            onChange(e.target.value, endDate)
          }}
          className="px-2 py-1.5 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-xs text-[#2a2420] dark:text-[#F5F0EB]"
        />
        <span className="text-xs text-[#6b5d57] dark:text-[#7A716A]">até</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => {
            setActivePreset('custom')
            onChange(startDate, e.target.value)
          }}
          className="px-2 py-1.5 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-xs text-[#2a2420] dark:text-[#F5F0EB]"
        />
      </div>
    </div>
  )
}
