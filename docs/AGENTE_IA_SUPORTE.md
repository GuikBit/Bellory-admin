# Agente IA - Suporte N1

## Visão Geral

Sistema de atendimento ao cliente automatizado (suporte N1) onde um agente IA (Gemini via n8n) atende dúvidas dos clientes, consulta uma base de conhecimento (RAG com PGVector), e transfere para atendimento humano quando não consegue resolver após 3 tentativas.

**Arquitetura**: n8n orquestra tudo. Admin e cliente chamam webhooks n8n diretamente. Chat "real-time" via polling (3s focado, 10s em background).

---

## Stack Técnica

| Componente | Tecnologia |
|------------|-----------|
| LLM | Gemini (via n8n) |
| Orquestração | n8n (webhooks) |
| Vector Store | PGVector (PostgreSQL) |
| Embeddings | Google Gemini `gemini-embedding-001` |
| Banco de Dados | PostgreSQL (`bellory_suporte`) |
| Frontend Admin | React 19 + TanStack Query |
| Frontend Cliente | SuporteChat.tsx (React) |
| E-mail | n8n (SMTP/Email node) |

---

## Database: `bellory_suporte`

Schema SQL em: `docs/schema_bellory_suporte.sql`

| Tabela | Função |
|--------|--------|
| `sessoes` | Tickets de atendimento com status, modo (ia/humano), tentativas |
| `mensagens` | Todas as mensagens (cliente, agente, humano, sistema) |
| `documentos_base` | Metadata dos documentos da base de conhecimento |
| `transferencias` | Registro de transferências e notificações por email |
| `document_chunks` | Chunks + embeddings do PGVector (criada pelo n8n existente) |

---

## Webhooks n8n

### Cliente (SuporteChat.tsx chama):

| Endpoint | Método | Função |
|----------|--------|--------|
| `/webhook/suporte` | POST | Mensagem do cliente → sessão → IA ou humano → resposta |
| `/webhook/suporte_mensagens_poll` | GET | Polling: retorna msgs novas do humano/sistema |

### Admin (Bellory-admin chama):

| Endpoint | Método | Função |
|----------|--------|--------|
| `/webhook/suporte_dashboard` | GET | Métricas agregadas |
| `/webhook/suporte_atendimentos` | GET | Lista sessões com filtros |
| `/webhook/suporte_atendimento_detalhe` | GET | Sessão + mensagens |
| `/webhook/suporte_resposta_humana` | POST | Admin responde ao cliente |
| `/webhook/suporte_resolver_atendimento` | POST | Marca como resolvido |
| `/webhook/suporte_poll_admin` | GET | Polling: msgs novas do cliente |
| `/webhook/suporte_documentos` | GET | Lista docs da base |
| `/webhook/suporte_registrar_documento` | POST | Registra metadata |
| `/webhook/suporte_upload_base_conhecimento` | POST | Upload arquivo (existente) |
| `/webhook/suporte_atualizar_documento` | POST | Atualiza status/chunks |
| `/webhook/suporte_excluir_documento` | POST | Exclui doc + chunks PGVector |

---

## Fluxo de Atendimento

```
                          ┌─────────────────┐
                          │   SuporteChat    │
                          │   (Cliente)      │
                          └────────┬────────┘
                                   │ POST /webhook/suporte
                                   ▼
                          ┌─────────────────┐
                          │     n8n          │
                          │  (Orquestrador)  │
                          └────────┬────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    ▼              ▼               ▼
             ┌──────────┐  ┌──────────┐   ┌──────────────┐
             │ Sessão   │  │ PGVector │   │   Gemini     │
             │ (DB)     │  │  (RAG)   │   │   (LLM)      │
             └──────────┘  └──────────┘   └──────┬───────┘
                                                  │
                                    ┌─────────────┤
                                    ▼             ▼
                              Resolvido?    Falhou 3x?
                                 │              │
                                 ▼              ▼
                            Responde      Transfere para
                            ao cliente    atendimento humano
                                              │
                                    ┌─────────┤
                                    ▼         ▼
                              ┌──────────┐ ┌─────────────┐
                              │  E-mail  │ │ Admin Panel  │
                              │  (n8n)   │ │ (Bellory)    │
                              └──────────┘ └──────┬──────┘
                                                   │ POST /webhook/suporte_resposta_humana
                                                   ▼
                                           ┌──────────────┐
                                           │  Cliente     │
                                           │  (via poll)  │
                                           └──────────────┘
```

### Fluxo detalhado:

1. **Cliente** envia mensagem via SuporteChat → `POST /webhook/suporte`
2. **n8n** verifica/cria sessão (30min TTL), salva mensagem no banco
3. Se `modo = ia`:
   - Consulta base de conhecimento (RAG) via PGVector
   - Gemini gera resposta
   - Salva resposta no banco
   - Se não resolveu → incrementa `tentativas_falhas`
   - Se `tentativas_falhas >= 3` → transfere: muda status, envia email, notifica cliente
4. Se `modo = humano`:
   - Salva mensagem no banco
   - Responde "Mensagem enviada ao atendente"
5. **Admin** vê ticket transferido na lista (polling 15s)
6. **Admin** abre chat, responde → `POST /webhook/suporte_resposta_humana`
7. **Cliente** recebe resposta via polling (3s)
8. **Admin** resolve → `POST /webhook/suporte_resolver_atendimento`
9. **Cliente** volta para modo IA

---

## Arquivos do Projeto

### Frontend Admin (`src/pages/agente-ia/`)
```
├── AgenteIALayout.tsx      # Layout com tabs + URL params
├── AgenteIADashboard.tsx   # Dashboard com métricas reais
├── BaseConhecimento.tsx    # CRUD documentos + upload multipart
├── Atendimentos.tsx        # Lista + filtros + chat integrado
├── ChatAtendimento.tsx     # Chat real-time admin ↔ cliente
└── Configuracoes.tsx       # Configurações (localStorage V1)
```

### Service Layer
```
src/types/suporte.ts        # Interfaces TypeScript
src/services/suporte.ts     # Axios → n8n webhooks (baseURL: auto.bellory.com.br)
src/queries/useSuporte.ts   # React Query hooks + polling
```

### n8n Workflows (importar no n8n)
```
docs/Bellory - Suporte Chat Principal.json    # Webhook suporte + sessão + IA + transferência
docs/Bellory - Suporte Admin Webhooks.json    # Todos os webhooks admin
docs/My workflow 2.json                        # Upload base conhecimento (existente, não alterar)
```

### Database
```
docs/schema_bellory_suporte.sql   # CREATE TABLE para executar no bellory_suporte
```

### Cliente
```
docs/SuporteChat.tsx   # Componente atualizado com sessionId, modo, polling
```

---

## Setup (passo a passo)

### 1. Banco de Dados
```sql
-- Conectar no PostgreSQL e criar o banco (se não existir)
CREATE DATABASE bellory_suporte;

-- Conectar no bellory_suporte e executar
\i docs/schema_bellory_suporte.sql
```

### 2. n8n
1. Importar `docs/Bellory - Suporte Chat Principal.json`
   - Configurar nó do agente IA (Gemini) no ponto marcado
   - Configurar nó de email com credenciais SMTP
   - Ativar o workflow
2. Importar `docs/Bellory - Suporte Admin Webhooks.json`
   - Ativar o workflow
3. O `My workflow 2.json` já deve estar ativo (upload KB)

### 3. Frontend Admin
- Os services já apontam para `https://auto.bellory.com.br`
- Acessar `/agente-ia` no admin

### 4. Cliente
- Copiar `docs/SuporteChat.tsx` para o projeto do cliente
- Passar `webhookUrl="https://auto.bellory.com.br/webhook/suporte"`

---

## Configurações

As configurações (nome do agente, mensagens padrão, email, limites) são salvas em `localStorage` na V1. Para V2, criar webhook `suporte_configuracoes` que persiste no banco.

- **Email de notificação**: guilhermeoliveira1998@gmail.com
- **Tentativas antes de transferir**: 3
- **TTL da sessão**: 30 minutos
- **Polling intervalo**: 3s (focado) / 10s (background)
