import { useState, useMemo } from 'react'
import { NavLink, Outlet, Navigate, useLocation } from 'react-router-dom'
import { cn } from '../../utils/cn'
import { DateRangeSelector } from './components/DateRangeSelector'

const tabs = [
  { path: '/analytics/overview', label: 'Overview' },
  { path: '/analytics/traffic', label: 'Tráfego' },
  { path: '/analytics/behavior', label: 'Comportamento' },
  { path: '/analytics/conversions', label: 'Conversões' },
  { path: '/analytics/context', label: 'Contexto' },
  { path: '/analytics/realtime', label: 'Tempo Real' },
]

function getDefaultDates(): [string, string] {
  const today = new Date()
  const past = new Date(today)
  past.setDate(past.getDate() - 30)
  const toISO = (d: Date) => d.toISOString().split('T')[0]
  return [toISO(past), toISO(today)]
}

export function AnalyticsLayout() {
  const location = useLocation()
  const [defaults] = useState(getDefaultDates)
  const [startDate, setStartDate] = useState(defaults[0])
  const [endDate, setEndDate] = useState(defaults[1])

  const isRealtime = location.pathname === '/analytics/realtime'

  const dateRange = useMemo(() => ({ startDate, endDate }), [startDate, endDate])

  if (location.pathname === '/analytics') {
    return <Navigate to="/analytics/overview" replace />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB]">
          Analytics do Site
        </h1>
        {!isRealtime && (
          <DateRangeSelector
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => { setStartDate(s); setEndDate(e) }}
          />
        )}
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-[#d8ccc4] dark:border-[#2D2925]">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) => cn(
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors -mb-px',
              isActive
                ? 'border-[#db6f57] text-[#db6f57] dark:border-[#E07A62] dark:text-[#E07A62]'
                : 'border-transparent text-[#6b5d57] hover:text-[#2a2420] dark:text-[#B8AEA4] dark:hover:text-[#F5F0EB]'
            )}
          >
            {tab.label}
          </NavLink>
        ))}
      </div>

      <Outlet context={dateRange} />
    </div>
  )
}
