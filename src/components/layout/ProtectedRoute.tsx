import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-b from-[#faf8f6] to-white dark:from-[#0D0B0A] dark:to-[#141210]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#db6f57] to-[#8b3d35] dark:from-[#E07A62] dark:to-[#A8524A] flex items-center justify-center animate-pulse">
            <span className="text-white font-bold">B</span>
          </div>
          <div className="w-8 h-8 border-2 border-[#db6f57] dark:border-[#E07A62] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
