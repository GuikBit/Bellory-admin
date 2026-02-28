import { Button } from '../ui/Button'
import { Plus, X, Sparkles } from 'lucide-react'
import type { VariavelTemplate } from '../../types/template'

interface VariaveisEditorProps {
  value: VariavelTemplate[]
  onChange: (vars: VariavelTemplate[]) => void
  sugestoes?: VariavelTemplate[]
}

export function VariaveisEditor({ value, onChange, sugestoes }: VariaveisEditorProps) {
  const addVar = () => onChange([...value, { nome: '', descricao: '', exemplo: '' }])

  const removeVar = (index: number) => onChange(value.filter((_, i) => i !== index))

  const updateVar = (index: number, field: keyof VariavelTemplate, val: string) => {
    const updated = [...value]
    updated[index] = { ...updated[index], [field]: val }
    onChange(updated)
  }

  const loadSugestoes = () => {
    if (!sugestoes) return
    // Adiciona apenas as que não existem
    const existingNames = new Set(value.map((v) => v.nome))
    const novas = sugestoes.filter((s) => !existingNames.has(s.nome))
    onChange([...value, ...novas])
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#6b5d57] dark:text-[#7A716A] uppercase tracking-wider">
          {value.length} {value.length === 1 ? 'variável' : 'variáveis'}
        </span>
        <div className="flex gap-2">
          {sugestoes && sugestoes.length > 0 && (
            <Button size="sm" variant="ghost" onClick={loadSugestoes} leftIcon={<Sparkles size={13} />}>
              Carregar sugestões
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={addVar} leftIcon={<Plus size={13} />}>
            Adicionar
          </Button>
        </div>
      </div>

      {value.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-[#d8ccc4] dark:border-[#2D2925] rounded-lg">
          <p className="text-sm text-[#6b5d57] dark:text-[#7A716A] mb-2">Nenhuma variável adicionada</p>
          <div className="flex gap-2 justify-center">
            {sugestoes && sugestoes.length > 0 && (
              <Button size="sm" variant="ghost" onClick={loadSugestoes} leftIcon={<Sparkles size={13} />}>
                Carregar sugestões
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={addVar} leftIcon={<Plus size={13} />}>
              Adicionar variável
            </Button>
          </div>
        </div>
      ) : (
        <>
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[1fr_1fr_1fr_32px] gap-2 px-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Nome</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Descrição</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#6b5d57] dark:text-[#7A716A]">Exemplo</span>
            <span />
          </div>

          {/* Rows */}
          {value.map((v, index) => (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1fr_32px] gap-2 group">
              <input
                type="text"
                value={v.nome}
                onChange={(e) => updateVar(index, 'nome', e.target.value)}
                placeholder="nome_variavel"
                className="h-8 px-2.5 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-xs font-mono placeholder:text-[#6b5d57]/50 dark:placeholder:text-[#7A716A] focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] transition-colors"
              />
              <input
                type="text"
                value={v.descricao}
                onChange={(e) => updateVar(index, 'descricao', e.target.value)}
                placeholder="Descrição"
                className="h-8 px-2.5 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-xs placeholder:text-[#6b5d57]/50 dark:placeholder:text-[#7A716A] focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] transition-colors"
              />
              <input
                type="text"
                value={v.exemplo}
                onChange={(e) => updateVar(index, 'exemplo', e.target.value)}
                placeholder="Valor exemplo"
                className="h-8 px-2.5 rounded-lg border border-[#d8ccc4] dark:border-[#2D2925] bg-white dark:bg-[#1A1715] text-[#2a2420] dark:text-[#F5F0EB] text-xs placeholder:text-[#6b5d57]/50 dark:placeholder:text-[#7A716A] focus:outline-none focus:border-[#db6f57] dark:focus:border-[#E07A62] transition-colors"
              />
              <button
                type="button"
                onClick={() => removeVar(index)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-[#6b5d57] dark:text-[#7A716A] hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 max-sm:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
