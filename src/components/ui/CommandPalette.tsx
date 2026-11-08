import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutDashboard,
  Wand2,
  Code,
  CodeXml,
  LayoutTemplate,
  Globe,
  Bot,
  SearchCode,
  MessageCircle,
  FileText,
  Trophy,
  GraduationCap,
  Image as ImageIcon,
  Video,
  Settings,
  BookMarked,
  ShieldAlert,
  PieChart,
  Key,
  NotebookPen,
  ArrowRight,
  Sparkles,
  Command,
  X
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

interface CommandItem {
  id: string
  title: string
  description: string
  to: string
  category: string
  icon: any
  badge?: string
  keywords?: string
}

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

export const CommandPalette = ({ isOpen, onClose }: CommandPaletteProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const isAdmin = user?.email === 'willrandrier@gmail.com'
  const isPartner = user?.email === 'souza.abencoado4@gmail.com'

  const allItems = useMemo<CommandItem[]>(() => {
    const base: CommandItem[] = [
      {
        id: 'dashboard',
        title: 'Resumo Global (Dashboard)',
        description: 'Métricas de faturamento, gráficos de receita e atalhos rápidos',
        to: '/dashboard',
        category: 'Painel Principal',
        icon: LayoutDashboard,
        keywords: 'inicio home vendas faturamento painel'
      },
      {
        id: 'updates',
        title: 'Central de Atualizações & Novidades (v3.0)',
        description: 'Veja tudo que foi adicionado na plataforma e dispare notificações de atualização',
        to: '/atualizacoes',
        category: 'Painel Principal',
        icon: Sparkles,
        badge: 'V3.0',
        keywords: 'atualizacoes novidades changelog notificacoes versao'
      },
      {
        id: 'creator',
        title: 'Creator IA',
        description: 'Gere abordagens irresistíveis e scripts personalizados para WhatsApp',
        to: '/creator',
        category: 'Inteligência Artificial & Vendas',
        icon: Wand2,
        badge: 'POPULAR',
        keywords: 'copy abordagem mensagem whatsapp vendas'
      },
      {
        id: 'prompt-builder',
        title: 'Prompt Builder Pro',
        description: 'Construa super-prompts estruturados para criar sites e sistemas SaaS',
        to: '/prompt-builder',
        category: 'Criação & Desenvolvimento',
        icon: Code,
        badge: 'PRO',
        keywords: 'prompt gerador site landing page'
      },
      {
        id: 'code-workspace',
        title: 'AI Code Workspace',
        description: 'Edite, melhore e personalize códigos HTML/CSS/JS com inteligência artificial',
        to: '/code-workspace',
        category: 'Criação & Desenvolvimento',
        icon: CodeXml,
        badge: 'NOVO',
        keywords: 'editor codigo html ia workspace'
      },
      {
        id: 'builder',
        title: 'Hospedar Novo Site',
        description: 'Publique sua página HTML na nuvem com botão mágico de WhatsApp e Chatbot',
        to: '/builder',
        category: 'Criação & Desenvolvimento',
        icon: LayoutTemplate,
        keywords: 'publicar hospedar dominio landing page'
      },
      {
        id: 'sites',
        title: 'Meus Sites Hospedados',
        description: 'Gerencie seus sites ativos, visualizações, links e relatórios de clientes',
        to: '/sites',
        category: 'Criação & Desenvolvimento',
        icon: Globe,
        keywords: 'sites publicados links'
      },
      {
        id: 'scanner',
        title: 'Scanner de Leads (Google Maps)',
        description: 'Encontre empresas locais sem site ou com presença digital fraca para prospectar',
        to: '/scanner',
        category: 'Prospecção & Leads',
        icon: Search,
        badge: 'HOT',
        keywords: 'prospeccao clientes empresas google maps'
      },
      {
        id: 'cnpj',
        title: 'Dossiê CNPJ',
        description: 'Consulte dados empresariais, sócios, capital social e contatos por CNPJ',
        to: '/cnpj',
        category: 'Prospecção & Leads',
        icon: SearchCode,
        keywords: 'consulta empresa receita federal'
      },
      {
        id: 'scripts',
        title: 'Scripts X1 de Alta Conversão',
        description: 'Templates prontos de abordagem, quebra de objeções e fechamento no WhatsApp',
        to: '/scripts',
        category: 'Prospecção & Leads',
        icon: MessageCircle,
        keywords: 'mensagens objecao fechamento'
      },
      {
        id: 'chatbots',
        title: 'Chatbots de IA',
        description: 'Crie assistentes virtuais inteligentes para atender visitantes nos seus sites',
        to: '/chatbots',
        category: 'Inteligência Artificial & Vendas',
        icon: Bot,
        keywords: 'atendimento automatico robo ia'
      },
      {
        id: 'library',
        title: 'Biblioteca IA',
        description: 'Histórico completo de todas as abordagens e criações geradas pela sua conta',
        to: '/library',
        category: 'Inteligência Artificial & Vendas',
        icon: BookMarked,
        keywords: 'historico salvos'
      },
      {
        id: 'contracts',
        title: 'CRM Kanban (Gestão de Contratos)',
        description: 'Organize seu funil comercial, propostas enviadas e contratos fechados',
        to: '/contracts',
        category: 'Gestão & CRM',
        icon: FileText,
        keywords: 'clientes pipeline funil vendas'
      },
      {
        id: 'proposta',
        title: 'Gerador de Proposta & Contrato PDF',
        description: 'Gere propostas comerciais executivas e contratos jurídicos prontos para PDF ou WhatsApp',
        to: '/proposta',
        category: 'Gestão & CRM',
        icon: FileText,
        badge: 'PRO',
        keywords: 'proposta contrato pdf comercial'
      },
      {
        id: 'finance',
        title: 'Financeiro & Receita',
        description: 'Acompanhe faturamento confirmado, pipeline do CRM, ticket médio e exporte CSV',
        to: '/finance',
        category: 'Gestão & CRM',
        icon: PieChart,
        keywords: 'financeiro faturamento receita caixa'
      },
      {
        id: 'image-to-link',
        title: 'Converter Imagem em URL',
        description: 'Faça upload de imagens e gere links diretos para usar nos seus sites',
        to: '/image-to-link',
        category: 'Utilitários & Mídia',
        icon: ImageIcon,
        keywords: 'foto hospedar imagem link'
      },
      {
        id: 'videos',
        title: 'Vídeos & Links Rápidos',
        description: 'Hospede vídeos de vendas (VSL) e gere páginas de reprodução',
        to: '/videos',
        category: 'Utilitários & Mídia',
        icon: Video,
        keywords: 'vsl player video'
      },
      {
        id: 'tutoriais',
        title: 'Tutoriais & Aulas',
        description: 'Aprenda passo a passo como extrair o máximo da plataforma e vender todos os dias',
        to: '/tutoriais',
        category: 'Comunidade & Ensino',
        icon: GraduationCap,
        badge: 'AULAS',
        keywords: 'curso aulas treinamento'
      },
      {
        id: 'ranking',
        title: 'Top Global (Ranking)',
        description: 'Veja o ranking dos membros que mais faturam na comunidade GhostMarket',
        to: '/ranking',
        category: 'Comunidade & Ensino',
        icon: Trophy,
        keywords: 'placar lideres premiacao'
      },
      {
        id: 'vip',
        title: 'Comunidade VIP no WhatsApp',
        description: 'Acesse o grupo oficial de networking e avisos dos membros Elite',
        to: '/vip',
        category: 'Comunidade & Ensino',
        icon: MessageCircle,
        keywords: 'grupo whatsapp suporte networking'
      },
      {
        id: 'settings',
        title: 'Minha Agência (White-Label)',
        description: 'Personalize nome da agência, foto de perfil e cores do sistema',
        to: '/settings',
        category: 'Configurações',
        icon: Settings,
        keywords: 'perfil conta marca cores'
      }
    ]

    if (isAdmin) {
      base.push(
        {
          id: 'admin',
          title: 'Painel Admin (Liberação & Usuários)',
          description: 'Gerencie acessos VIP, códigos de teste e visualize clientes com God-Eye',
          to: '/admin',
          category: 'Administração',
          icon: ShieldAlert,
          badge: 'ADM',
          keywords: 'usuarios liberar acesso'
        },
        {
          id: 'quiz-analytics',
          title: 'Analytics do Quiz',
          description: 'Funil de conversão, visitas, respostas detalhadas e leads do diagnóstico',
          to: '/quiz/analytics',
          category: 'Administração',
          icon: PieChart,
          badge: 'ADM',
          keywords: 'quiz leads metricas'
        },
        {
          id: 'admin-notes',
          title: 'Backlog & Notas da Equipe',
          description: 'Anotações internas e organização de tarefas administrativas',
          to: '/admin/notes',
          category: 'Administração',
          icon: NotebookPen,
          badge: 'ADM',
          keywords: 'notas tarefas'
        }
      )
    } else if (isPartner) {
      base.push(
        {
          id: 'socio',
          title: 'Painel do Sócio (Códigos VIP)',
          description: 'Gere códigos temporários para leads testarem a plataforma',
          to: '/socio',
          category: 'Painel Sócio',
          icon: Key,
          badge: 'SÓCIO',
          keywords: 'codigo teste trial'
        },
        {
          id: 'quiz-analytics',
          title: 'Analytics do Quiz',
          description: 'Acompanhe leads, visualizações e conversões do quiz',
          to: '/quiz/analytics',
          category: 'Painel Sócio',
          icon: PieChart,
          badge: 'SÓCIO',
          keywords: 'quiz leads'
        }
      )
    }

    return base
  }, [isAdmin, isPartner])

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return allItems
    return allItems.filter(
      item =>
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.keywords && item.keywords.toLowerCase().includes(q))
    )
  }, [allItems, search])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search, isOpen])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    } else {
      setSearch('')
    }
  }, [isOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
      }
      if (!isOpen) return

      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(prev => (filteredItems.length > 0 ? (prev + 1) % filteredItems.length : 0))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(prev => (filteredItems.length > 0 ? (prev - 1 + filteredItems.length) % filteredItems.length : 0))
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault()
        navigate(filteredItems[selectedIndex].to)
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, filteredItems, selectedIndex, navigate, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-[#0E0E11] border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-10"
          >
            {/* Search Input Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-800/80 bg-[#09090B]">
              <Search className="w-4 h-4 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar ferramenta ou comando... (Ex: Scanner, Prompt, Sites, CRM)"
                className="flex-1 bg-transparent text-zinc-100 placeholder:text-zinc-500 text-sm focus:outline-none"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={onClose}
                className="text-[10px] font-mono font-semibold text-zinc-400 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-2 py-0.5 rounded transition-colors"
              >
                ESC
              </button>
            </div>

            {/* Results List */}
            <div className="max-h-[60vh] overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="py-12 text-center">
                  <Sparkles className="w-6 h-6 text-zinc-600 mx-auto mb-2.5" />
                  <p className="text-zinc-200 text-sm font-medium">Nenhuma ferramenta encontrada para "{search}"</p>
                  <p className="text-xs text-zinc-500 mt-1">Tente buscar por "Creator", "Scanner", "Site" ou "CRM".</p>
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const Icon = item.icon
                  const isSelected = idx === selectedIndex
                  const isCurrentRoute = location.pathname === item.to

                  return (
                    <button
                      key={item.id}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      onClick={() => {
                        navigate(item.to)
                        onClose()
                      }}
                      className={`w-full flex items-center gap-3.5 px-3 py-2.5 rounded-lg text-left transition-colors ${
                        isSelected
                          ? 'bg-zinc-800/90 text-white'
                          : 'hover:bg-zinc-900/60 text-zinc-300'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors border ${
                          isSelected
                            ? 'bg-zinc-100 text-zinc-950 border-white'
                            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium text-[13px] truncate ${isSelected ? 'text-white' : 'text-zinc-200'}`}>
                            {item.title}
                          </span>
                          {item.badge && (
                            <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                              {item.badge}
                            </span>
                          )}
                          {isCurrentRoute && (
                            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                              Atual
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">{item.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="hidden sm:inline-block text-[10px] text-zinc-500 font-medium">
                          {item.category}
                        </span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 transition-transform ${
                            isSelected ? 'text-zinc-200 translate-x-0.5' : 'text-zinc-600'
                          }`}
                        />
                      </div>
                    </button>
                  )
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t border-zinc-800/80 bg-[#09090B] flex items-center justify-between text-[11px] text-zinc-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-400 font-mono">↑↓</kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-400 font-mono">↵</kbd>
                  Abrir
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-400 font-mono">Esc</kbd>
                  Fechar
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium">
                <Command className="w-3 h-3" />
                <span>GhostMarket OS</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
