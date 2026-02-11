import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOrganizacoes } from '../../queries/useOrganizacoes'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { TableSkeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { formatDate, formatNumber } from '../../utils/format'
import {
  Search,
  Building2,
  ChevronRight,
  ArrowUpDown,
  Users,
  CalendarCheck,
  Filter,
} from 'lucide-react'
import type { OrganizacaoList } from '../../types/organizacao'

type SortKey = 'nomeFantasia' | 'totalClientes' | 'totalAgendamentos' | 'dtCadastro'
type SortDir = 'asc' | 'desc'

const planBadgeVariant: Record<string, 'default' | 'success' | 'warning' | 'info' | 'plan'> = {
  gratuito: 'default',
  basico: 'info',
  plus: 'plan',
  premium: 'success',
}

export function OrganizacoesList() {
  const { data, isLoading, error } = useOrganizacoes()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ativo' | 'inativo'>('all')
  const [filterPlano, setFilterPlano] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('nomeFantasia')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    if (!data) return []
    let result = [...data]

    // Search
    if (search) {
      const term = search.toLowerCase()
      result = result.filter(
        (o) =>
          o.nomeFantasia.toLowerCase().includes(term) ||
          o.cnpj.includes(term) ||
          o.emailPrincipal.toLowerCase().includes(term)
      )
    }

    // Filter status
    if (filterStatus === 'ativo') result = result.filter((o) => o.ativo)
    if (filterStatus === 'inativo') result = result.filter((o) => !o.ativo)

    // Filter plan
    if (filterPlano !== 'all') result = result.filter((o) => o.planoCodigo === filterPlano)

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

    return result
  }, [data, search, filterStatus, filterPlano, sortKey, sortDir])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  if (error) {
    return (
      <EmptyState
        icon={<Building2 size={48} />}
        title="Erro ao carregar"
        description="Não foi possível carregar as organizações."
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome, CNPJ ou email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={18} />}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
          leftIcon={<Filter size={16} />}
        >
          Filtros
        </Button>
      </div>

      {showFilters && (
        <Card className="p-4">
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                className="h-9 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62]"
              >
                <option value="all">Todos</option>
                <option value="ativo">Ativos</option>
                <option value="inativo">Inativos</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6b5d57] dark:text-[#B8AEA4] mb-1">Plano</label>
              <select
                value={filterPlano}
                onChange={(e) => setFilterPlano(e.target.value)}
                className="h-9 px-3 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-sm focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62]"
              >
                <option value="all">Todos</option>
                <option value="gratuito">Gratuito</option>
                <option value="basico">Básico</option>
                <option value="plus">Plus</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#6b5d57] dark:text-[#7A716A]">
          {isLoading ? 'Carregando...' : `${filtered.length} organizações encontradas`}
        </p>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <TableSkeleton rows={8} />
        </Card>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 size={48} />}
          title="Nenhuma organização"
          description={search ? 'Nenhum resultado para sua busca.' : 'Nenhuma organização cadastrada.'}
        />
      ) : (
        <>
          {/* Desktop table */}
          <Card className="hidden lg:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#d8ccc4] dark:border-[#2D2925]">
                    <th className="text-left px-4 py-3">
                      <button onClick={() => toggleSort('nomeFantasia')} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]">
                        Organização <ArrowUpDown size={12} />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Plano</th>
                    <th className="text-center px-4 py-3">
                      <button onClick={() => toggleSort('totalClientes')} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A] hover:text-[#2a2420] dark:hover:text-[#F5F0EB] mx-auto">
                        Clientes <ArrowUpDown size={12} />
                      </button>
                    </th>
                    <th className="text-center px-4 py-3">
                      <button onClick={() => toggleSort('totalAgendamentos')} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A] hover:text-[#2a2420] dark:hover:text-[#F5F0EB] mx-auto">
                        Agendamentos <ArrowUpDown size={12} />
                      </button>
                    </th>
                    <th className="text-left px-4 py-3">
                      <button onClick={() => toggleSort('dtCadastro')} className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A] hover:text-[#2a2420] dark:hover:text-[#F5F0EB]">
                        Cadastro <ArrowUpDown size={12} />
                      </button>
                    </th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((org) => (
                    <tr
                      key={org.id}
                      onClick={() => navigate(`/organizacoes/${org.id}`)}
                      className="border-b border-[#d8ccc4]/50 dark:border-[#2D2925]/50 hover:bg-[#faf8f6] dark:hover:bg-[#2D2925]/30 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-[#2a2420] dark:text-[#F5F0EB]">{org.nomeFantasia}</p>
                          <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{org.emailPrincipal}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={org.ativo ? 'success' : 'danger'}>
                          {org.ativo ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={planBadgeVariant[org.planoCodigo] || 'default'}>
                          {org.planoNome}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                        {formatNumber(org.totalClientes)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-[#2a2420] dark:text-[#F5F0EB]">
                        {formatNumber(org.totalAgendamentos)}
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6b5d57] dark:text-[#B8AEA4]">
                        {formatDate(org.dtCadastro)}
                      </td>
                      <td className="px-4 py-3">
                        <ChevronRight size={16} className="text-[#d8ccc4] dark:text-[#2D2925]" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((org) => (
              <Card
                key={org.id}
                hover
                className="p-4 cursor-pointer"
                onClick={() => navigate(`/organizacoes/${org.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-[#2a2420] dark:text-[#F5F0EB]">{org.nomeFantasia}</h3>
                    <p className="text-xs text-[#6b5d57] dark:text-[#7A716A]">{org.emailPrincipal}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={org.ativo ? 'success' : 'danger'}>
                      {org.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                    <Badge variant={planBadgeVariant[org.planoCodigo] || 'default'}>
                      {org.planoNome}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#6b5d57] dark:text-[#B8AEA4]">
                  <span className="flex items-center gap-1"><Users size={12} /> {org.totalClientes}</span>
                  <span className="flex items-center gap-1"><CalendarCheck size={12} /> {org.totalAgendamentos}</span>
                  <span>{formatDate(org.dtCadastro)}</span>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
