import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Bot, Send, X, Loader2, Trash2, ImagePlus, UserCheck } from "lucide-react";
import { useLocation } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

// ── Tipos ────────────────────────────────────────────────────────────

interface Mensagem {
  id: string;
  remetente: "usuario" | "assistente" | "sistema";
  texto: string;
  imagens?: string[]; // base64 data URLs
  timestamp: Date;
}

interface SuporteChatProps {
  onClose?: () => void;
  apiKey?: string;
  webhookUrl: string;
}

// ── Mapeamento de rotas → módulo ─────────────────────────────────────

interface ModuloInfo {
  nome: string;
  descricao: string;
}

const ROTAS_MODULOS: { pattern: RegExp; modulo: ModuloInfo }[] = [
  { pattern: /^\/admin\/dashboard$/,                   modulo: { nome: "Dashboard",              descricao: "Painel principal com métricas e resumos" } },
  { pattern: /^\/admin\/agendamento$/,                 modulo: { nome: "Agendamento",            descricao: "Monitoramento e gestão de agendamentos" } },
  { pattern: /^\/admin\/servicos\/categorias$/,        modulo: { nome: "Categorias de Serviços", descricao: "Gerenciamento de categorias de serviços" } },
  { pattern: /^\/admin\/servicos\/novo$/,              modulo: { nome: "Novo Serviço",           descricao: "Cadastro de novo serviço" } },
  { pattern: /^\/admin\/servicos\/detalhes\/\d+$/,     modulo: { nome: "Detalhes do Serviço",    descricao: "Visualização e edição de um serviço" } },
  { pattern: /^\/admin\/servicos$/,                    modulo: { nome: "Serviços",               descricao: "Listagem e gestão de serviços" } },
  { pattern: /^\/admin\/colaboradores\/\d+$/,          modulo: { nome: "Detalhes do Colaborador", descricao: "Perfil, agenda e configurações de um colaborador" } },
  { pattern: /^\/admin\/colaboradores$/,               modulo: { nome: "Colaboradores",          descricao: "Listagem e gestão de colaboradores" } },
  { pattern: /^\/admin\/ecommerce\/produtos$/,         modulo: { nome: "Produtos",               descricao: "Listagem e gestão de produtos do e-commerce" } },
  { pattern: /^\/admin\/clientes\/\d+$/,               modulo: { nome: "Detalhes do Cliente",    descricao: "Perfil e histórico de um cliente" } },
  { pattern: /^\/admin\/clientes$/,                    modulo: { nome: "Clientes",               descricao: "Listagem e gestão de clientes" } },
  { pattern: /^\/admin\/relatorios$/,                  modulo: { nome: "Relatórios",             descricao: "Relatórios e análises do negócio" } },
  { pattern: /^\/admin\/financeiro$/,                  modulo: { nome: "Financeiro",             descricao: "Gestão financeira e fluxo de caixa" } },
  { pattern: /^\/admin\/notificacao$/,                 modulo: { nome: "Notificações",           descricao: "Central de notificações" } },
  { pattern: /^\/admin\/atualizacoes$/,                modulo: { nome: "Atualizações",           descricao: "Novidades e atualizações do sistema" } },
  { pattern: /^\/admin\/configuracoes\/empresa$/,      modulo: { nome: "Configurações - Empresa", descricao: "Dados da organização, plano e personalização" } },
  { pattern: /^\/admin\/configuracoes\/landingpages$/, modulo: { nome: "Configurações - Landing Pages", descricao: "Gerenciamento de landing pages" } },
  { pattern: /^\/admin\/configuracoes\/whatsapp$/,     modulo: { nome: "Configurações - WhatsApp", descricao: "Instâncias e configurações de WhatsApp" } },
  { pattern: /^\/admin\/configuracoes\/geral$/,        modulo: { nome: "Configurações - Geral",  descricao: "Configurações gerais do sistema" } },
  { pattern: /^\/admin\/configuracoes\/api$/,          modulo: { nome: "Configurações - API",    descricao: "Chaves de API e integrações" } },
  { pattern: /^\/admin\/configuracoes\/questionario$/, modulo: { nome: "Configurações - Questionário", descricao: "Gestão de questionários" } },
  { pattern: /^\/admin\/configuracoes/,                modulo: { nome: "Configurações",          descricao: "Configurações do sistema" } },
  { pattern: /^\/admin/,                               modulo: { nome: "Painel Administrativo",  descricao: "Área administrativa geral" } },
];

function detectarModulo(pathname: string): ModuloInfo {
  for (const rota of ROTAS_MODULOS) {
    if (rota.pattern.test(pathname)) {
      return rota.modulo;
    }
  }
  return { nome: "Sistema", descricao: "Área geral do sistema" };
}

// ── Persistência com TTL de 30 minutos ──────────────────────────────

const STORAGE_KEY = "bellory_suporte_chat";
const TTL_MS = 30 * 60 * 1000; // 30 minutos
const POLL_URL_BASE = "https://auto.bellory.com.br/webhook/suporte_mensagens_poll";

interface ChatStorage {
  mensagens: (Omit<Mensagem, "timestamp"> & { timestamp: string })[];
  salvoEm: number;
  sessionId: string;
  modo: "ia" | "humano";
}

function salvarChat(mensagens: Mensagem[], sessionId: string, modo: "ia" | "humano") {
  const data: ChatStorage = {
    mensagens: mensagens.map((m) => ({ ...m, timestamp: m.timestamp.toISOString() })),
    salvoEm: Date.now(),
    sessionId,
    modo,
  };
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function carregarChat(): { mensagens: Mensagem[]; sessionId: string; modo: "ia" | "humano" } | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const data: ChatStorage = JSON.parse(raw);

    if (Date.now() - data.salvoEm > TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return {
      mensagens: data.mensagens.map((m) => ({ ...m, timestamp: new Date(m.timestamp) })),
      sessionId: data.sessionId || '',
      modo: data.modo || "ia",
    };
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function limparStorage() {
  sessionStorage.removeItem(STORAGE_KEY);
}

// ── Componente ───────────────────────────────────────────────────────

const SuporteChat = ({ onClose, apiKey, webhookUrl }: SuporteChatProps) => {
  const { currentTheme: theme } = useTheme();
  const { userLogado, org, token} = useAuth();
  const location = useLocation();

  const moduloAtual = useMemo(() => detectarModulo(location.pathname), [location.pathname]);

  const criarMensagemBoasVindas = useCallback(
    (nomeModulo: string): Mensagem => ({
      id: "welcome",
      remetente: "assistente",
      texto: `Olá${userLogado?.nomeCompleto ? `, ${userLogado.nomeCompleto.split(" ")[0]}` : ""}! 👋\n Sou o assistente virtual da Bellory.\nVocê está no módulo de **${nomeModulo}**. Como posso te ajudar?`,
      timestamp: new Date(),
    }),
    [userLogado?.nomeCompleto]
  );

  // Estado inicial carregado do storage
  const savedChat = useMemo(() => carregarChat(), []);

  const [mensagens, setMensagens] = useState<Mensagem[]>(() => {
    return savedChat?.mensagens && savedChat.mensagens.length > 0
      ? savedChat.mensagens
      : [criarMensagemBoasVindas(moduloAtual.nome)];
  });
  const [sessionId, setSessionId] = useState<string>(() => {
    return savedChat?.sessionId || crypto.randomUUID();
  });
  const [modo, setModo] = useState<"ia" | "humano">(savedChat?.modo || "ia");
  const [input, setInput] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [anexos, setAnexos] = useState<string[]>([]);
  const [lastPollTime, setLastPollTime] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const moduloAnteriorRef = useRef(moduloAtual.nome);

  // Persiste no sessionStorage a cada mudança
  useEffect(() => {
    salvarChat(mensagens, sessionId, modo);
  }, [mensagens, sessionId, modo]);

  // Quando muda de módulo, avisa no chat
  useEffect(() => {
    if (moduloAnteriorRef.current !== moduloAtual.nome) {
      moduloAnteriorRef.current = moduloAtual.nome;
      setMensagens((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          remetente: "assistente",
          texto: `Você navegou para o módulo de **${moduloAtual.nome}**. Posso te ajudar com algo aqui?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [moduloAtual.nome]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  // ── Polling quando modo humano ─────────────────────────────────────

  useEffect(() => {
    if (modo !== "humano") return;

    let ativo = true;
    let timer: ReturnType<typeof setTimeout>;

    const poll = async () => {
      if (!ativo) return;
      try {
        const params = new URLSearchParams({ sessionId });
        if (lastPollTime) params.append("after", lastPollTime);

        const res = await fetch(`${POLL_URL_BASE}?${params}`);
        if (!res.ok) return;

        const data = await res.json();

        if (data.mensagens && data.mensagens.length > 0) {
          const novas: Mensagem[] = data.mensagens.map((m: { id: string; autor: string; conteudo: string; criado_em: string }) => ({
            id: m.id || crypto.randomUUID(),
            remetente: m.autor === "humano" ? "assistente" as const : "sistema" as const,
            texto: m.conteudo,
            timestamp: new Date(m.criado_em),
          }));

          setMensagens((prev) => [...prev, ...novas]);
          setLastPollTime(data.mensagens[data.mensagens.length - 1].criado_em);
        }

        // Se resolvido, voltar para modo IA
        if (data.status === "resolvido") {
          setModo("ia");
          setMensagens((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              remetente: "sistema",
              texto: "Seu atendimento foi resolvido pelo suporte. O assistente IA voltou a atender.",
              timestamp: new Date(),
            },
          ]);
        }
      } catch {
        // silently fail
      }

      if (ativo) {
        timer = setTimeout(poll, document.hasFocus() ? 3000 : 10000);
      }
    };

    timer = setTimeout(poll, 3000);

    return () => {
      ativo = false;
      clearTimeout(timer);
    };
  }, [modo, sessionId, lastPollTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // ── Imagens ────────────────────────────────────────────────────────

  const processarImagem = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setAnexos((prev) => [...prev, reader.result as string]);
      }
    };
    reader.readAsDataURL(file);
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) processarImagem(file);
        }
      }
    },
    [processarImagem]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;
      Array.from(files).forEach(processarImagem);
      e.target.value = "";
    },
    [processarImagem]
  );

  const removerAnexo = useCallback((index: number) => {
    setAnexos((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // ── Enviar mensagem para o n8n ──────────────────────────────────────

  const enviarMensagem = useCallback(async () => {
    const texto = input.trim();
    if ((!texto && anexos.length === 0) || carregando) return;

    const imagensEnvio = [...anexos];

    const novaMensagem: Mensagem = {
      id: crypto.randomUUID(),
      remetente: "usuario",
      texto,
      imagens: imagensEnvio.length > 0 ? imagensEnvio : undefined,
      timestamp: new Date(),
    };

    setMensagens((prev) => [...prev, novaMensagem]);
    setInput("");
    setAnexos([]);
    setCarregando(true);

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const payload = {
        mensagem: texto,
        sessionId,
        modulo: {
          nome: moduloAtual.nome,
          descricao: moduloAtual.descricao,
          rota: location.pathname,
        },
        organizacao: {
          id: org?.id,
          nome: org?.razaoSocial,
          tenantId: org?.slug,
        },
        usuario: {
          id: userLogado?.id,
          nome: userLogado?.nomeCompleto,
          email: userLogado?.email,
          role: userLogado?.roles,
        },
        imagens: imagensEnvio.length > 0 ? imagensEnvio : undefined,
        apiKey: token || undefined,
        historico: mensagens
          .filter((m) => m.id !== "welcome")
          .map((m) => ({
            remetente: m.remetente,
            texto: m.texto,
          })),
      };

      console.log(payload)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status}`);
      }

      const data = await response.json();

      // Se o n8n retornar um sessionId diferente, usar o do n8n
      if (data.sessionId && data.sessionId !== sessionId) {
        setSessionId(data.sessionId);
      }
      if (data.modo) {
        const novoModo = data.modo as "ia" | "humano";
        if (novoModo !== modo) {
          setModo(novoModo);
          // Se transferido, mostrar mensagem de sistema
          if (novoModo === "humano" && data.transferido) {
            setMensagens((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(),
                remetente: "sistema",
                texto: "Você foi transferido para um atendente humano. Aguarde, em breve alguém irá te atender.",
                timestamp: new Date(),
              },
            ]);
          }
        }
      }

      const respostaAssistente: Mensagem = {
        id: crypto.randomUUID(),
        remetente: "assistente",
        texto: data.resposta || data.output || data.message || "Desculpe, não consegui processar sua solicitação.",
        timestamp: new Date(),
      };

      setMensagens((prev) => [...prev, respostaAssistente]);
    } catch {
      setMensagens((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          remetente: "assistente",
          texto: "Ops! Ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setCarregando(false);
      inputRef.current?.focus();
    }
  }, [input, anexos, carregando, mensagens, moduloAtual, location.pathname, org, userLogado, token, webhookUrl, sessionId, modo]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensagem();
    }
  };

  const limparConversa = () => {
    limparStorage();
    setSessionId(crypto.randomUUID());
    setModo("ia");
    setLastPollTime("");
    setMensagens([criarMensagemBoasVindas(moduloAtual.nome)]);
  };

  // ── Renderizar mensagem com formatação ──────────────────────────────

  const renderTexto = (texto: string) => {
    const blocos = texto.split(/(```[\s\S]*?```)/);

    return blocos.map((bloco, bi) => {
      if (bloco.startsWith("```") && bloco.endsWith("```")) {
        const codigo = bloco.slice(3, -3).replace(/^\n/, "");
        return (
          <pre
            key={bi}
            className="my-1.5 p-2.5 rounded-lg text-xs overflow-x-auto font-mono"
            style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
          >
            <code>{codigo}</code>
          </pre>
        );
      }

      const linhas = bloco.split("\n");
      return linhas.map((linha, li) => (
        <span key={`${bi}-${li}`}>
          {formatarLinha(linha)}
          {li < linhas.length - 1 && <br />}
        </span>
      ));
    });
  };

  const formatarLinha = (linha: string) => {
    const regex = /(\*\*.*?\*\*|\*(?!\s).*?(?<!\s)\*|_(?!\s).*?(?<!\s)_|~(?!\s).*?(?<!\s)~|`[^`]+`)/g;
    const partes = linha.split(regex);

    return partes.map((parte, i) => {
      if (parte.startsWith("**") && parte.endsWith("**")) {
        return <strong key={i}>{parte.slice(2, -2)}</strong>;
      }
      if (parte.startsWith("*") && parte.endsWith("*") && parte.length > 2) {
        return <strong key={i}>{parte.slice(1, -1)}</strong>;
      }
      if (parte.startsWith("_") && parte.endsWith("_") && parte.length > 2) {
        return <em key={i}>{parte.slice(1, -1)}</em>;
      }
      if (parte.startsWith("~") && parte.endsWith("~") && parte.length > 2) {
        return <s key={i}>{parte.slice(1, -1)}</s>;
      }
      if (parte.startsWith("`") && parte.endsWith("`") && parte.length > 2) {
        return (
          <code
            key={i}
            className="px-1 py-0.5 rounded text-xs font-mono"
            style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
          >
            {parte.slice(1, -1)}
          </code>
        );
      }
      return parte;
    });
  };

  // ── JSX ─────────────────────────────────────────────────────────────

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="md:px-6 px-3 md:py-4 py-3 shadow z-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: modo === "humano" ? "#4f6f6415" : `${theme.colors.primary}15` }}
            >
              {modo === "humano" ? (
                <UserCheck size={20} style={{ color: "#4f6f64" }} />
              ) : (
                <Bot size={20} style={{ color: theme.colors.primary }} />
              )}
            </div>
            <div>
              <h2 className="md:text-lg text-base font-bold text-gray-800 dark:text-white">
                {modo === "humano" ? "Atendente Humano" : "Assistente Bellory"}
              </h2>
              <p className="md:text-sm text-xs text-gray-600 dark:text-gray-400">
                {modo === "humano"
                  ? "Conectado com atendente · Aguardando resposta"
                  : `Suporte inteligente · ${moduloAtual.nome}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              className="p-2 rounded-full cursor-pointer transition-all hover:scale-105"
              style={{ backgroundColor: `${theme.colors.primary}10` }}
              onClick={limparConversa}
              title="Limpar conversa"
            >
              <Trash2 size={16} style={{ color: theme.colors.primary }} />
            </button>
            <button
              className="p-2 rounded-full cursor-pointer transition-all hover:scale-105"
              style={{ backgroundColor: `${theme.colors.primary}10` }}
              onClick={onClose}
              title="Fechar"
            >
              <X size={20} style={{ color: theme.colors.primary }} />
            </button>
          </div>
        </div>
      </div>

      {/* Mensagens + Input flutuante */}
      <div className="flex-1 relative overflow-hidden" style={{ background: theme.colors.background }}>
        <div
          className={`h-full overflow-auto md:p-4 p-3 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-thumb-primary/30 scrollbar-track-transparent space-y-3 ${anexos.length > 0 ? "md:pb-38 pb-35" : "md:pb-20 pb-20"}`}
        >
          <AnimatePresence initial={false}>
            {mensagens.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${
                  msg.remetente === "usuario"
                    ? "justify-end"
                    : msg.remetente === "sistema"
                    ? "justify-center"
                    : "justify-start"
                }`}
              >
                {msg.remetente === "sistema" ? (
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 max-w-[85%]">
                    <p className="text-xs text-gray-500 dark:text-gray-400 italic text-center">
                      {msg.texto}
                    </p>
                  </div>
                ) : (
                  <div
                    className={`max-w-[85%] md:max-w-[75%] shadow rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.remetente === "usuario"
                        ? "rounded-br-md text-white"
                        : "rounded-bl-md "
                    }
                    ${msg.remetente === "usuario" ? "bg-primary":"dark:bg-[#262626] bg-white dark:text-white text-[#374151]"}
                    `}
                  >
                    {msg.imagens && msg.imagens.length > 0 && (
                      <div className={`flex flex-wrap gap-1.5 ${msg.texto ? "mb-1.5" : ""}`}>
                        {msg.imagens.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Anexo ${idx + 1}`}
                            className="rounded-lg max-w-full max-h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => window.open(img, "_blank")}
                          />
                        ))}
                      </div>
                    )}
                    {msg.texto && renderTexto(msg.texto)}
                    <div
                      className={`text-[10px] mt-1 opacity-50 ${
                        msg.remetente === "usuario" ? "text-right" : "text-left"
                      }`}
                    >
                      {msg.timestamp.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Indicador de digitação */}
          {carregando && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div
                className="rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2"
                style={{ backgroundColor: `${theme.colors.primary}10` }}
              >
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: theme.colors.primary }}
                      animate={{ y: [0, -6, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-xs ml-1"
                  style={{ color: `${theme.colors.primary}90` }}
                >
                  {modo === "humano" ? "Enviando..." : "Pensando..."}
                </span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input flutuante por cima */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2 pt-6"
          style={{
            background: `linear-gradient(to bottom, transparent, ${theme.colors.background} 40%)`,
          }}
        >
          {/* Preview dos anexos */}
          <AnimatePresence>
            {anexos.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 mb-1 overflow-x-auto overflow-y-visible pt-2 pb-1 scrollbar-none"
              >
                {anexos.map((anexo, idx) => (
                  <div key={idx} className="relative shrink-0 group">
                    <img
                      src={anexo}
                      alt={`Anexo ${idx + 1}`}
                      className="h-16 max-w-32 object-cover rounded-lg border"
                      style={{ borderColor: `${theme.colors.primary}20` }}
                    />
                    <button
                      onClick={() => removerAnexo(idx)}
                      className="z-999 absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      style={{ backgroundColor: theme.colors.primary }}
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="flex items-center gap-2 rounded-full px-1 py-1 shadow-lg border relative"
            style={{
              backgroundColor: theme.colors.cardBackground,
              borderColor: modo === "humano" ? "#4f6f6430" : `${theme.colors.primary}30`,
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={carregando}
              className="p-1.5 ml-3 rounded-lg transition-all cursor-pointer hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              title="Anexar imagem"
            >
              <ImagePlus size={18} style={{ color: `${theme.colors.primary}90` }} />
            </button>
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={modo === "humano" ? "Envie uma mensagem ao atendente..." : "Digite sua dúvida..."}
              rows={1}
              disabled={carregando}
              className="flex-1 bg-transparent text-sm resize-none outline-none placeholder:text-gray-400 dark:text-white max-h-[120px] min-h-9 leading-9"
              style={{ color: theme.colors.text }}
            />
            <button
              onClick={enviarMensagem}
              disabled={(!input.trim() && anexos.length === 0) || carregando}
              className="p-2.5 rounded-xl transition-all cursor-pointer hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              style={{
                backgroundColor: (input.trim() || anexos.length > 0) && !carregando
                  ? (modo === "humano" ? "#4f6f64" : theme.colors.primary)
                  : `${theme.colors.primary}30`,
              }}
            >
              {carregando ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <Send size={18} className="text-white" />
              )}
            </button>
          </div>
          <p className="text-[10px] text-center mt-1.5 dark:text-neutral-400 text-neutral-500">
            {modo === "humano"
              ? "Conectado com atendente humano · Suporte Bellory"
              : "Respostas geradas por IA · Primeiro nível de suporte"}
          </p>
        </div>

      </div>
    </div>
  );
};

export default SuporteChat;
