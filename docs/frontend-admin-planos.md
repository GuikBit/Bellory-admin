# Gerenciamento de Planos Bellory — Frontend Admin

## Contexto

O backend expõe um CRUD completo de planos em `/api/v1/admin/planos` (requer ROLE_SUPERADMIN ou ROLE_ADMIN). Este documento descreve tudo o que o frontend **Bellory-Admin** precisa implementar para consumir esses endpoints.

O projeto Bellory-Admin usa: **React 19 + Vite + TypeScript + Tailwind CSS + TanStack React Query + Axios + Lucide React + Framer Motion + react-hot-toast**.

Não usa shadcn/ui — os componentes UI são customizados em `components/ui/` (Button, Input, Card, Badge, etc.).

---

## 1. API — Endpoints Disponíveis

Base URL já configurada no axios (`services/api.ts`) termina em `/api`, então os paths abaixo são relativos a isso.

| Método | Path | Descrição | Request Body | Response Body |
|--------|------|-----------|-------------|---------------|
| `GET` | `/v1/admin/planos` | Listar todos (inclusive inativos) | — | `ResponseAPI<PlanoBellory[]>` |
| `GET` | `/v1/admin/planos/:id` | Buscar por ID | — | `ResponseAPI<PlanoBellory>` |
| `POST` | `/v1/admin/planos` | Criar plano | `PlanoBelloryCreate` | `ResponseAPI<PlanoBellory>` |
| `PUT` | `/v1/admin/planos/:id` | Atualizar plano | `PlanoBelloryUpdate` | `ResponseAPI<PlanoBellory>` |
| `DELETE` | `/v1/admin/planos/:id` | Desativar (soft delete) | — | `ResponseAPI<void>` |
| `PATCH` | `/v1/admin/planos/:id/ativar` | Reativar plano | — | `ResponseAPI<PlanoBellory>` |
| `PUT` | `/v1/admin/planos/reordenar` | Reordenar planos | `ReordenarPlanos` | `ResponseAPI<void>` |

### Formato da Response (ResponseAPI)

Todas as respostas vêm encapsuladas neste formato:

```typescript
interface ResponseAPI<T> {
  success: boolean
  message: string
  dados: T        // <-- os dados reais ficam aqui
  errorCode?: number
  errors?: Record<string, string>
}
```

Então no service, para extrair os dados: `response.data.dados`.

---

## 2. Types — `src/types/plano.ts`

```typescript
// === Feature (item do array JSONB) ===
export interface PlanoFeature {
  text: string
  included: boolean
}

// === Limites do Plano ===
export interface PlanoLimites {
  maxAgendamentosMes: number | null    // null = ilimitado
  maxUsuarios: number | null
  maxClientes: number | null
  maxServicos: number | null
  maxUnidades: number | null
  permiteAgendamentoOnline: boolean
  permiteWhatsapp: boolean
  permiteSite: boolean
  permiteEcommerce: boolean
  permiteRelatoriosAvancados: boolean
  permiteApi: boolean
  permiteIntegracaoPersonalizada: boolean
  suportePrioritario: boolean
  suporte24x7: boolean
}

// === Response completa (GET lista e GET por ID) ===
export interface PlanoBellory {
  id: number
  codigo: string
  nome: string
  tagline: string | null
  descricaoCompleta: string | null
  ativo: boolean
  popular: boolean

  // Visual/UI
  cta: string | null             // Call-to-action: "Começar grátis"
  badge: string | null           // "🔥 Mais popular"
  icone: string | null           // Nome do ícone Lucide (Gift, Zap, Sparkles, Crown)
  cor: string | null             // "#4f6f64"
  gradiente: string | null       // "from-[#4f6f64] to-[#3d574f]"

  // Preços
  precoMensal: number
  precoAnual: number
  descontoPercentualAnual: number | null

  // Features e Limites
  features: PlanoFeature[]
  limites: PlanoLimites | null

  // Ordem
  ordemExibicao: number | null

  // Auditoria
  dtCriacao: string
  dtAtualizacao: string | null
  userCriacao: number | null
  userAtualizacao: number | null

  // Métricas
  totalOrganizacoesUsando: number
}

// === Input de criação (POST) ===
export interface PlanoBelloryCreate {
  codigo: string                  // Obrigatório, único, max 50
  nome: string                    // Obrigatório, max 100
  tagline?: string
  descricaoCompleta?: string
  popular?: boolean
  cta?: string
  badge?: string
  icone?: string
  cor?: string                    // hex, max 7 chars
  gradiente?: string
  precoMensal: number             // Obrigatório, >= 0
  precoAnual: number              // Obrigatório, >= 0
  descontoPercentualAnual?: number
  features?: PlanoFeature[]
  ordemExibicao?: number
  limites?: PlanoLimites
}

// === Input de atualização (PUT) — tudo opcional ===
export interface PlanoBelloryUpdate {
  codigo?: string
  nome?: string
  tagline?: string
  descricaoCompleta?: string
  popular?: boolean
  cta?: string
  badge?: string
  icone?: string
  cor?: string
  gradiente?: string
  precoMensal?: number
  precoAnual?: number
  descontoPercentualAnual?: number
  features?: PlanoFeature[]
  ordemExibicao?: number
  limites?: PlanoLimites
}

// === Input de reordenação (PUT /reordenar) ===
export interface ReordenarPlanos {
  planos: PlanoOrdem[]
}

export interface PlanoOrdem {
  id: number
  ordemExibicao: number
}
```

---

## 3. Service — `src/services/planos.ts`

```typescript
import { api } from './api'
import type {
  PlanoBellory,
  PlanoBelloryCreate,
  PlanoBelloryUpdate,
  ReordenarPlanos,
} from '../types/plano'

// Listar todos os planos (incluindo inativos)
export async function getPlanos(): Promise<PlanoBellory[]> {
  const response = await api.get('/v1/admin/planos')
  return response.data.dados
}

// Buscar plano por ID
export async function getPlano(id: number): Promise<PlanoBellory> {
  const response = await api.get(`/v1/admin/planos/${id}`)
  return response.data.dados
}

// Criar plano
export async function criarPlano(data: PlanoBelloryCreate): Promise<PlanoBellory> {
  const response = await api.post('/v1/admin/planos', data)
  return response.data.dados
}

// Atualizar plano
export async function atualizarPlano(id: number, data: PlanoBelloryUpdate): Promise<PlanoBellory> {
  const response = await api.put(`/v1/admin/planos/${id}`, data)
  return response.data.dados
}

// Desativar plano (soft delete)
export async function desativarPlano(id: number): Promise<void> {
  await api.delete(`/v1/admin/planos/${id}`)
}

// Ativar plano
export async function ativarPlano(id: number): Promise<PlanoBellory> {
  const response = await api.patch(`/v1/admin/planos/${id}/ativar`)
  return response.data.dados
}

// Reordenar planos
export async function reordenarPlanos(data: ReordenarPlanos): Promise<void> {
  await api.put('/v1/admin/planos/reordenar', data)
}
```

---

## 4. Query Hooks — `src/queries/usePlanos.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPlanos,
  getPlano,
  criarPlano,
  atualizarPlano,
  desativarPlano,
  ativarPlano,
  reordenarPlanos,
} from '../services/planos'
import type { PlanoBelloryCreate, PlanoBelloryUpdate, ReordenarPlanos } from '../types/plano'
import toast from 'react-hot-toast'

const QUERY_KEY = 'admin-planos'

export function usePlanos() {
  return useQuery({
    queryKey: [QUERY_KEY],
    queryFn: getPlanos,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  })
}

export function usePlano(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getPlano(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: !!id,
  })
}

export function useCriarPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlanoBelloryCreate) => criarPlano(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Plano criado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar plano')
    },
  })
}

export function useAtualizarPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PlanoBelloryUpdate }) => atualizarPlano(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Plano atualizado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar plano')
    },
  })
}

export function useDesativarPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => desativarPlano(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Plano desativado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao desativar plano')
    },
  })
}

export function useAtivarPlano() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => ativarPlano(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Plano ativado com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao ativar plano')
    },
  })
}

export function useReordenarPlanos() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ReordenarPlanos) => reordenarPlanos(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] })
      toast.success('Planos reordenados com sucesso')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao reordenar planos')
    },
  })
}
```

---

## 5. Páginas a Criar

### 5.1. `src/pages/planos/PlanosList.tsx`

Página principal de listagem. Deve conter:

- **Tabela/Cards** com todos os planos (ativos e inativos), ordenados por `ordemExibicao`
- Cada item mostra: nome, código, preço mensal, badge "Popular" se aplicável, status (ativo/inativo), total de orgs usando, ícone colorido com a `cor` do plano
- **Busca** por nome/código
- **Filtro** por status (Todos / Ativos / Inativos)
- **Botão "Novo Plano"** → navega para `/planos/novo`
- **Ações por plano**: Editar, Desativar/Ativar (com confirmação), clique na linha vai para detalhe
- **Drag & drop** ou botões ↑↓ para reordenar (chama `PUT /reordenar` ao salvar)
- Badge visual indicando quantas organizações usam cada plano (se > 0, não pode desativar)
- Skeleton loading usando os componentes existentes de `components/ui/Skeleton`

### 5.2. `src/pages/planos/PlanoForm.tsx`

Página de criação e edição (reutiliza o mesmo componente). Se recebe `id` via URL params, é modo edição (carrega dados com `usePlano(id)`), senão é criação.

**Campos do formulário organizados em seções:**

**Informações Básicas:**
- `codigo` — Input texto (obrigatório na criação, editável no update). Slug-like, lowercase.
- `nome` — Input texto (obrigatório)
- `tagline` — Input texto (opcional). Frase curta tipo "Experimente sem compromisso"
- `descricaoCompleta` — Textarea (opcional)

**Preços:**
- `precoMensal` — Input numérico (obrigatório, >= 0). Formatado como moeda BRL
- `precoAnual` — Input numérico (obrigatório, >= 0)
- `descontoPercentualAnual` — Input numérico (opcional). Ex: 20 = 20%

**Visual/UI:**
- `popular` — Toggle/switch boolean
- `cta` — Input texto. Call-to-action do botão. Ex: "Começar grátis", "Assinar agora"
- `badge` — Input texto. Ex: "🔥 Mais popular", "Melhor custo-benefício"
- `icone` — Select/dropdown com ícones Lucide disponíveis (Gift, Zap, Sparkles, Crown, Star, etc.)
- `cor` — Color picker hex. Ex: "#4f6f64"
- `gradiente` — Input texto para classes Tailwind. Ex: "from-[#4f6f64] to-[#3d574f]"
- `ordemExibicao` — Input numérico

**Features (array dinâmico):**
- Lista editável de features
- Cada item: `text` (input texto) + `included` (toggle boolean)
- Botões: "Adicionar feature", remover feature (ícone X)
- Drag & drop para reordenar features (opcional)

**Limites do Plano (seção com toggles e inputs numéricos):**
- `maxAgendamentosMes` — Input numérico (null = ilimitado, usar checkbox "Ilimitado")
- `maxUsuarios` — Input numérico (null = ilimitado)
- `maxClientes` — Input numérico (null = ilimitado)
- `maxServicos` — Input numérico (null = ilimitado)
- `maxUnidades` — Input numérico (null = ilimitado)
- `permiteAgendamentoOnline` — Toggle
- `permiteWhatsapp` — Toggle
- `permiteSite` — Toggle
- `permiteEcommerce` — Toggle
- `permiteRelatoriosAvancados` — Toggle
- `permiteApi` — Toggle
- `permiteIntegracaoPersonalizada` — Toggle
- `suportePrioritario` — Toggle
- `suporte24x7` — Toggle

**Ações:**
- Botão "Salvar" (chama POST ou PUT dependendo do modo)
- Botão "Cancelar" (navega de volta para `/planos`)

**Preview (lateral ou abaixo):**
- Mostrar um card de preview em tempo real conforme os campos são preenchidos, simulando como o plano será exibido no site público (com ícone, cor, badge, preço, features com check/x)

### 5.3. `src/pages/planos/PlanoDetail.tsx` (opcional)

Se quiser uma página separada de visualização somente leitura com todas as informações do plano, incluindo dados de auditoria (quem criou, quando atualizou) e métricas (quantas orgs usam).

---

## 6. Integração no Projeto Existente

### 6.1. Rotas — `src/App.tsx`

Adicionar os lazy imports e rotas dentro do bloco protegido:

```typescript
// Lazy imports (adicionar junto com os outros)
const PlanosList = lazy(() => import('./pages/planos/PlanosList').then(m => ({ default: m.PlanosList })))
const PlanoForm = lazy(() => import('./pages/planos/PlanoForm').then(m => ({ default: m.PlanoForm })))

// Dentro de <Routes>, no bloco ProtectedRoute + AdminLayout:
<Route path="/planos" element={<PlanosList />} />
<Route path="/planos/novo" element={<PlanoForm />} />
<Route path="/planos/:id" element={<PlanoForm />} />
```

### 6.2. Sidebar — `src/components/layout/Sidebar.tsx`

Adicionar item no menu principal (fora do submenu Métricas, como item de nível superior, igual a "Organizações"):

```typescript
import { /* ... existentes ... */, CreditCard } from 'lucide-react'

// No array navItems, adicionar após { path: '/organizacoes', ... }:
{ path: '/planos', icon: CreditCard, label: 'Planos' },
```

---

## 7. Dados de Exemplo (para referência visual)

```json
{
  "id": 1,
  "codigo": "gratuito",
  "nome": "Gratuito",
  "tagline": "Experimente sem compromisso",
  "descricaoCompleta": "Ideal para quem está começando e quer testar a plataforma.",
  "ativo": true,
  "popular": false,
  "cta": "Começar grátis",
  "badge": null,
  "icone": "Gift",
  "cor": "#6b7280",
  "gradiente": "from-[#6b7280] to-[#4b5563]",
  "precoMensal": 0.00,
  "precoAnual": 0.00,
  "descontoPercentualAnual": null,
  "features": [
    { "text": "Até 50 agendamentos/mês", "included": true },
    { "text": "1 profissional", "included": true },
    { "text": "Painel básico", "included": true },
    { "text": "WhatsApp", "included": false },
    { "text": "Site próprio", "included": false },
    { "text": "Relatórios avançados", "included": false }
  ],
  "limites": {
    "maxAgendamentosMes": 50,
    "maxUsuarios": 1,
    "maxClientes": 30,
    "maxServicos": 5,
    "maxUnidades": 1,
    "permiteAgendamentoOnline": false,
    "permiteWhatsapp": false,
    "permiteSite": false,
    "permiteEcommerce": false,
    "permiteRelatoriosAvancados": false,
    "permiteApi": false,
    "permiteIntegracaoPersonalizada": false,
    "suportePrioritario": false,
    "suporte24x7": false
  },
  "ordemExibicao": 1,
  "dtCriacao": "2025-01-15T10:30:00",
  "dtAtualizacao": null,
  "userCriacao": 1,
  "userAtualizacao": null,
  "totalOrganizacoesUsando": 12
}
```

Exemplo de plano popular:

```json
{
  "id": 3,
  "codigo": "plus",
  "nome": "Plus",
  "tagline": "Para negócios em crescimento",
  "ativo": true,
  "popular": true,
  "cta": "Assinar agora",
  "badge": "🔥 Mais popular",
  "icone": "Sparkles",
  "cor": "#4f6f64",
  "gradiente": "from-[#4f6f64] to-[#3d574f]",
  "precoMensal": 89.90,
  "precoAnual": 862.80,
  "descontoPercentualAnual": 20.0,
  "features": [
    { "text": "Agendamentos ilimitados", "included": true },
    { "text": "Até 5 profissionais", "included": true },
    { "text": "WhatsApp integrado", "included": true },
    { "text": "Site próprio", "included": true },
    { "text": "Relatórios avançados", "included": true },
    { "text": "API", "included": false },
    { "text": "Integração personalizada", "included": false }
  ],
  "limites": {
    "maxAgendamentosMes": null,
    "maxUsuarios": 5,
    "maxClientes": null,
    "maxServicos": null,
    "maxUnidades": 2,
    "permiteAgendamentoOnline": true,
    "permiteWhatsapp": true,
    "permiteSite": true,
    "permiteEcommerce": false,
    "permiteRelatoriosAvancados": true,
    "permiteApi": false,
    "permiteIntegracaoPersonalizada": false,
    "suportePrioritario": true,
    "suporte24x7": false
  },
  "ordemExibicao": 3,
  "totalOrganizacoesUsando": 45
}
```

---

## 8. Resumo — Arquivos a Criar

| Arquivo | Tipo |
|---------|------|
| `src/types/plano.ts` | TypeScript interfaces |
| `src/services/planos.ts` | Funções de chamada à API |
| `src/queries/usePlanos.ts` | React Query hooks (queries + mutations) |
| `src/pages/planos/PlanosList.tsx` | Página de listagem |
| `src/pages/planos/PlanoForm.tsx` | Página de criação/edição |

## Arquivos a Modificar

| Arquivo | O que alterar |
|---------|---------------|
| `src/App.tsx` | Adicionar lazy imports + 3 rotas (`/planos`, `/planos/novo`, `/planos/:id`) |
| `src/components/layout/Sidebar.tsx` | Adicionar item "Planos" com ícone `CreditCard` |

---

## 9. Regras de Negócio Importantes

1. **Código é único** — a API retorna erro se tentar criar/atualizar com código duplicado
2. **Não pode desativar plano em uso** — se `totalOrganizacoesUsando > 0`, o DELETE retorna erro com mensagem explicando quantas orgs usam o plano. O frontend deve exibir essa mensagem e idealmente desabilitar o botão de desativar quando `totalOrganizacoesUsando > 0`
3. **Limites `null` = ilimitado** — na UI, usar um checkbox "Ilimitado" que quando marcado seta o valor como `null`
4. **Features são um array JSONB** — ordem importa, pois é a ordem que aparece no site público
5. **`ordemExibicao`** controla a ordem dos planos na listagem e no site público
