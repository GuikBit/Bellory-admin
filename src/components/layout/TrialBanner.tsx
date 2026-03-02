import { Clock, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function TrialBanner() {
  const navigate = useNavigate()
  const { assinatura } = useAuth()

  if (!assinatura || assinatura.statusAssinatura !== 'TRIAL' || assinatura.bloqueado) {
    return null
  }

  const dias = assinatura.diasRestantesTrial ?? 0
  const urgente = dias <= 3

  return (
    <div className={`px-4 py-2 text-sm flex items-center justify-between ${
      urgente ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
    }`}>
      <div className="flex items-center gap-2">
        <Clock className="w-4 h-4" />
        <span>
          {dias > 0
            ? `Período de teste: ${dias} ${dias === 1 ? 'dia restante' : 'dias restantes'}`
            : 'Seu período de teste expira hoje!'}
        </span>
      </div>
      <button
        onClick={() => navigate('/escolher-plano')}
        className="flex items-center gap-1 font-medium hover:underline"
      >
        Escolher plano <ArrowRight className="w-3 h-3" />
      </button>
    </div>
  )
}
