import { cn } from '../../utils/cn'
import type { VariavelTemplate, TipoTemplate } from '../../types/template'

interface VariavelChipProps {
  variavel: VariavelTemplate
  tipoTemplate: TipoTemplate
  onClick: (placeholder: string) => void
}

export function VariavelChip({ variavel, tipoTemplate, onClick }: VariavelChipProps) {
  const placeholder = tipoTemplate === 'WHATSAPP'
    ? `{{${variavel.nome}}}`
    : `\${${variavel.nome}}`

  return (
    <button
      type="button"
      onClick={() => onClick(placeholder)}
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono transition-all duration-200 border',
        'hover:shadow-sm active:scale-95',
        tipoTemplate === 'WHATSAPP'
          ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800 dark:hover:bg-green-900/30'
          : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800 dark:hover:bg-blue-900/30'
      )}
      title={`${variavel.descricao} — ex: ${variavel.exemplo}`}
    >
      {placeholder}
    </button>
  )
}
