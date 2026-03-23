-- =============================================================================
-- Schema: bellory_suporte (PostgreSQL)
-- Sistema de Suporte N1 com Agente IA - Bellory
-- =============================================================================

-- Sessões de atendimento (tickets)
CREATE TABLE IF NOT EXISTS sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizacao_id BIGINT,
    organizacao_nome VARCHAR(255),
    organizacao_tenant VARCHAR(100),
    usuario_id BIGINT,
    usuario_nome VARCHAR(255),
    usuario_email VARCHAR(255),
    modulo VARCHAR(100),
    assunto VARCHAR(500),
    status VARCHAR(20) NOT NULL DEFAULT 'ativo',       -- ativo | transferido | resolvido | expirado
    modo VARCHAR(10) NOT NULL DEFAULT 'ia',             -- ia | humano
    tentativas_falhas INT DEFAULT 0,
    motivo_transferencia TEXT,
    atendente_humano VARCHAR(255),
    satisfacao VARCHAR(10),                             -- positivo | negativo | null
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW(),
    ultima_mensagem_em TIMESTAMPTZ DEFAULT NOW(),
    encerrado_em TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessoes_status ON sessoes(status);
CREATE INDEX IF NOT EXISTS idx_sessoes_modo ON sessoes(modo);
CREATE INDEX IF NOT EXISTS idx_sessoes_criado ON sessoes(criado_em DESC);
CREATE INDEX IF NOT EXISTS idx_sessoes_org ON sessoes(organizacao_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_ultima_msg ON sessoes(ultima_mensagem_em DESC);

-- Mensagens de cada sessão
CREATE TABLE IF NOT EXISTS mensagens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sessao_id UUID NOT NULL REFERENCES sessoes(id) ON DELETE CASCADE,
    autor VARCHAR(20) NOT NULL,                         -- cliente | agente | humano | sistema
    conteudo TEXT NOT NULL,
    imagens TEXT[],
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mensagens_sessao ON mensagens(sessao_id, criado_em);
CREATE INDEX IF NOT EXISTS idx_mensagens_autor ON mensagens(sessao_id, autor);

-- Metadata dos documentos da base de conhecimento
CREATE TABLE IF NOT EXISTS documentos_base (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(500) NOT NULL UNIQUE,
    tipo VARCHAR(10) NOT NULL,                          -- pdf | txt | json | xlsx | docx
    tamanho VARCHAR(50),
    categoria VARCHAR(100) DEFAULT 'geral',
    status VARCHAR(20) DEFAULT 'processando',           -- processando | processado | erro
    chunks INT DEFAULT 0,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documentos_status ON documentos_base(status);

-- Registro de transferências (para auditoria e notificação)
CREATE TABLE IF NOT EXISTS transferencias (
    id SERIAL PRIMARY KEY,
    sessao_id UUID NOT NULL REFERENCES sessoes(id) ON DELETE CASCADE,
    email_destino VARCHAR(255) NOT NULL,
    email_enviado BOOLEAN DEFAULT FALSE,
    motivo TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transferencias_sessao ON transferencias(sessao_id);
