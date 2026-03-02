import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

interface Props {
  children: React.ReactNode
}

export function AssinaturaGuard({ children }: Props) {
  const { assinatura } = useAuth()

  if (assinatura?.bloqueado) {
    return <Navigate to="/escolher-plano" replace />
  }

  return <>{children}</>
}
