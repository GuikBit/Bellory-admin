import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAdminUsuarios, useDesativarAdminUsuario } from '../../queries/useAdminUsuarios'
import { useAuth } from '../../contexts/AuthContext'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { cn } from '../../utils/cn'
import {
  Search,
  Plus,
  ShieldCheck,
  Filter,
  Pencil,
  Power,
  PowerOff,
  AlertTriangle,
  Check,
  X,
} from 'lucide-react'
import type { AdminUser } from '../../types/adminUser'

type FilterStatus = 'all' | 'ativo' | 'inativo'

export function UsuariosList() {
  const { data, isLoading, error } = useAdminUsuarios()
  const desativarUsuario = useDesativarAdminUsuario()
  const { user: currentUser } = useAuth()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [confirmAction, setConfirmAction] = useState<{ id: number; nome: string } | null>(null)

  const filtered = useMemo(() => {
    if (!data) return []
    let result = [...data]

    if (search) {
      const term = search.toLowerCase()
      result = result.filter(
        (u) =>
          u.nomeCompleto.toLowerCase().includes(term) ||
          u.username.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
      )
    }

    if (filterStatus === 'ativo') result = result.filter((u) => u.ativo)
    if (filterStatus === 'inativo') result = result.filter((u) => !u.ativo)

    return result
  }, [data, search, filterStatus])

  const stats = useMemo(() => {
    if (!data) return { total: 0, ativos: 0, inativos: 0 }
    return {
      total: data.length,
      ativos: data.filter((u) => u.ativo).length,
      inativos: data.filter((u) => !u.ativo).length,
    }
  }, [data])

  const handleToggleStatus = (usuario: AdminUser) => {
    if (usuario.id === currentUser?.id) return
    if (usuario.ativo) {
      setConfirmAction({ id: usuario.id, nome: usuario.nomeCompleto })
    }
  }

  const handleConfirm = () => {
    if (!confirmAction) return
    desativarUsuario.mutate(confirmAction.id)
    setConfirmAction(null)
  }

  if (error) {
    return (
      <EmptyState
        icon={<ShieldCheck size={48} />}
        title="Erro ao carregar"
        description="Não foi possível carregar os usuários."
      />
    )
  }

  return (
    <div className="space-y-5">
      {/* Stats cards */}
      {!isLoading && data && (
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <p className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider">Total</p>
            <p className="text-2xl font-bold text-[#2a2420] dark:text-[#F5F0EB] mt-1">{stats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-[#4f6f64] dark:text-[#6B8F82] uppercase tracking-wider">Ativos</p>
            <p className="text-2xl font-bold text-[#4f6f64] dark:text-[#6B8F82] mt-1">{stats.ativos}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-medium text-red-500 dark:text-red-400 uppercase tracking-wider">Inativos</p>
            <p className="text-2xl font-bold text-red-500 dark:text-red-400 mt-1">{stats.inativos}</p>
          </Card>
        </div>
      )}

      {/* Search, filters, and actions bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome, username ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter size={16} />}
          >
            Filtros
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/usuarios/novo')}
            leftIcon={<Plus size={16} />}
          >
            <span className="hidden sm:inline">Novo Usuário</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                className="h-9 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62]"
              >
                <option value="all">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Results count */}
      <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">
        {isLoading ? 'Carregando...' : `${filtered.length} usuários encontrados`}
      </p>

      {isLoading ? (
        <Card className="p-6">
          <TableSkeleton rows={5} />
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ShieldCheck size={48} />}
          title="Nenhum usuário"
          description={search ? 'Nenhum resultado para sua busca.' : 'Nenhum usuário cadastrado ainda.'}
          action={
            <Button onClick={() => navigate('/usuarios/novo')} leftIcon={<Plus size={16} />}>
              Criar primeiro usuário
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Nome</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Username</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Email</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Criação</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className={cn(
                        'border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50 transition-colors hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/30',
                        !usuario.ativo && 'opacity-60'
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#4f6f64] dark:bg-[#6B8F82] flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-medium">
                              {usuario.nomeCompleto.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
                            {usuario.nomeCompleto}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <code className="text-xs font-mono px-2 py-1 rounded bg-[#faf8f6] dark:bg-[#2D2925] text-[#6b5d57] dark:text-[#B8AEA4]">
                          {usuario.username}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">{usuario.email}</span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={usuario.ativo ? 'success' : 'danger'}>
                          {usuario.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">{usuario.dtCriacao}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate(`/usuarios/${usuario.id}`)}
                            className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-[#faf8f6] dark:hover:bg-[#2D2925] hover:text-[#db6f57] dark:hover:text-[#E07A62] transition-colors"
                            title="Editar"
                          >
                            <Pencil size={15} />
                          </button>
                          {usuario.ativo && (
                            <button
                              onClick={() => handleToggleStatus(usuario)}
                              disabled={usuario.id === currentUser?.id}
                              className={cn(
                                'p-2 rounded-lg transition-colors',
                                usuario.id === currentUser?.id
                                  ? 'opacity-30 cursor-not-allowed text-[#6b5d57] dark:text-[#7A716A]'
                                  : 'text-[#6b5d57] dark:text-[#B8AEA4] hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400'
                              )}
                              title={usuario.id === currentUser?.id ? 'Não é possível desativar a si mesmo' : 'Desativar'}
                            >
                              <PowerOff size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((usuario) => (
              <Card
                key={usuario.id}
                className={cn('p-4', !usuario.ativo && 'opacity-60')}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#4f6f64] dark:bg-[#6B8F82] flex items-center justify-center shrink-0">
                      <span className="text-white text-sm font-medium">
                        {usuario.nomeCompleto.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{usuario.nomeCompleto}</h3>
                      <code className="text-[10px] font-mono text-[#6b5d57] dark:text-[#7A716A]">{usuario.username}</code>
                    </div>
                  </div>
                  <Badge variant={usuario.ativo ? 'success' : 'danger'}>
                    {usuario.ativo ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-xs text-[#6b5d57] dark:text-[#B8AEA4] truncate">
                    {usuario.email}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => navigate(`/usuarios/${usuario.id}`)}
                      className="p-2 rounded-lg text-[#6b5d57] dark:text-[#B8AEA4] hover:text-[#db6f57] dark:hover:text-[#E07A62]"
                    >
                      <Pencil size={14} />
                    </button>
                    {usuario.ativo && (
                      <button
                        onClick={() => handleToggleStatus(usuario)}
                        disabled={usuario.id === currentUser?.id}
                        className={cn(
                          'p-2 rounded-lg',
                          usuario.id === currentUser?.id
                            ? 'opacity-30 cursor-not-allowed'
                            : 'text-[#6b5d57] hover:text-red-500'
                        )}
                      >
                        <PowerOff size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setConfirmAction(null)}>
          <Card className="w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                <AlertTriangle size={20} className="text-red-500 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[#2a2420] dark:text-[#F5F0EB]">
                  Desativar usuário
                </h3>
                <p className="text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                  O usuário "{confirmAction.nome}" será desativado e não poderá mais acessar o painel.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setConfirmAction(null)}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirm}
                leftIcon={<X size={16} />}
              >
                Desativar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
