import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAdminUsuario, useCriarAdminUsuario, useAtualizarAdminUsuario } from '../../queries/useAdminUsuarios'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import {
  ArrowLeft,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react'
import type { AdminUserCreate, AdminUserUpdate } from '../../types/adminUser'

export function UsuarioForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id && id !== 'novo'
  const usuarioId = isEdit ? Number(id) : 0

  const { data: usuarioData, isLoading: isLoadingUsuario } = useAdminUsuario(usuarioId)
  const criarUsuario = useCriarAdminUsuario()
  const atualizarUsuario = useAtualizarAdminUsuario()

  const [username, setUsername] = useState('')
  const [nomeCompleto, setNomeCompleto] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (usuarioData) {
      setUsername(usuarioData.username)
      setNomeCompleto(usuarioData.nomeCompleto)
      setEmail(usuarioData.email)
    }
  }, [usuarioData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!username.trim() || username.trim().length < 3) newErrors.username = 'Username deve ter no mínimo 3 caracteres'
    if (username.trim().length > 50) newErrors.username = 'Username deve ter no máximo 50 caracteres'
    if (!nomeCompleto.trim()) newErrors.nomeCompleto = 'Nome completo é obrigatório'
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido'
    if (!isEdit && (!password || password.length < 6)) newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
    if (isEdit && password && password.length < 6) newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return

    if (isEdit) {
      const payload: AdminUserUpdate = {
        username: username.trim().toLowerCase(),
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim(),
      }
      if (password) payload.password = password
      atualizarUsuario.mutate(
        { id: usuarioId, data: payload },
        { onSuccess: () => navigate('/usuarios') }
      )
    } else {
      const payload: AdminUserCreate = {
        username: username.trim().toLowerCase(),
        nomeCompleto: nomeCompleto.trim(),
        email: email.trim(),
        password,
      }
      criarUsuario.mutate(payload, { onSuccess: () => navigate('/usuarios') })
    }
  }

  const isSaving = criarUsuario.isPending || atualizarUsuario.isPending

  if (isEdit && isLoadingUsuario) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-6 w-48" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/usuarios')}
            className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
              {isEdit ? 'Editar Usuário' : 'Novo Usuário'}
            </h1>
            <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">
              {isEdit ? `Editando "${usuarioData?.nomeCompleto || ''}"` : 'Preencha os dados para criar um novo usuário admin'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate('/usuarios')}>Cancelar</Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSaving}
            leftIcon={<Save size={16} />}
          >
            {isEdit ? 'Salvar' : 'Criar Usuário'}
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">Informações do Usuário</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Username"
                placeholder="ex: joao.suporte"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
                error={errors.username}
              />
              <Input
                label="Nome Completo"
                placeholder="ex: João da Silva"
                value={nomeCompleto}
                onChange={(e) => setNomeCompleto(e.target.value)}
                error={errors.nomeCompleto}
              />
              <Input
                label="Email"
                type="email"
                placeholder="ex: joao@bellory.com.br"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Input
                label={isEdit ? 'Nova Senha (opcional)' : 'Senha'}
                type={showPassword ? 'text' : 'password'}
                placeholder={isEdit ? 'Deixe vazio para manter' : 'Mínimo 6 caracteres'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="hover:text-[#2a2420] dark:hover:text-[#F5F0EB] transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
