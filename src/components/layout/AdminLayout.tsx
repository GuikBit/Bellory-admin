import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { TrialBanner } from './TrialBanner'

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#1A1715] backdrop-blur-md">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} collapsed={collapsed} onToggleCollapse={() => setCollapsed(!collapsed)} />

        <main className="flex-1 overflow-y-auto rounded-tl-2xl border-l border-t border-[#d8ccc4] dark:border-[#2D2925] bg-gradient-to-b from-[#faf8f6] to-white dark:from-[#0D0B0A] dark:to-[#141210]">
          <TrialBanner />
          <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full ">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
