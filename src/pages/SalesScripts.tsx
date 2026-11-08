import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Copy,
  Check,
  Zap,
  Target,
  ShieldAlert,
  Clock,
  Sparkles,
  User,
  Briefcase,
  Phone,
  Send,
  DollarSign
} from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { useContractStore } from '@/store/contractStore'

export const SalesScripts = () => {
  const { addToast } = useToastStore()
  const { contracts } = useContractStore()
  const [leadName, setLeadName] = useState('')
  const [leadNiche, setLeadNiche] = useState('')
  const [leadPhone, setLeadPhone] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const recentScannerLeads = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('ghost_scanner_state_v2')
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed.leads) ? parsed.leads : []
    } catch {
      return []
    }
  }, [])

  const handleImportLeadOption = (val: string) => {
    if (!val) return
    if (val.startsWith('crm:')) {
      const id = val.replace('crm:', '')
      const found = contracts.find(c => c.id === id)
      if (found) {
        setLeadName(found.client)
        setLeadNiche(found.niche || found.client)
        setLeadPhone(found.phone || '')
        addToast(`Lead "${found.client}" importado do CRM!`, 'success')
      }
    } else if (val.startsWith('scan:')) {
      const idx = Number(val.replace('scan:', ''))
      const found = recentScannerLeads[idx]
      if (found) {
        setLeadName(found.name || '')
        setLeadNiche(found.category || found.name || '')
        setLeadPhone(found.phone || '')
        addToast(`Lead "${found.name}" importado do Scanner!`, 'success')
      }
    }
  }

  const nomeFormatado = leadName.trim() ? leadName.trim().split(' ')[0] : 'tudo bem'
  const saudacaoNome = leadName.trim() ? `Fala ${leadName.trim().split(' ')[0]}, tudo bem?` : 'Opa, tudo bem?'
  const nichoFormatado = leadNiche.trim() ? leadNiche.trim() : 'seu negócio'
  const demoUrl = typeof window !== 'undefined' ? `${window.location.origin}/demo` : 'https://ghostmarket-ai.vercel.app/demo'

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    addToast('Script copiado para a área de transferência!', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const sendToWhatsApp = (text: string) => {
    const cleanPhone = leadPhone.replace(/\D/g, '')
    if (cleanPhone.length >= 10) {
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
      window.open(`https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`, '_blank')
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank')
    }
  }

  const scripts = useMemo(
    () => [
      {
        id: 'abordagem',
        category: '1. Abordagem Fria (Quebrar o Gelo)',
        icon: <Target className="w-5 h-5 text-blue-400" />,
        color: 'border-blue-500/30 bg-blue-500/5',
        badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        items: [
          {
            id: 'ab-1',
            title: 'Para Donos de Negócio Local (Google Maps / Instagram)',
            text: `${saudacaoNome} Vi o perfil de vocês e achei excelente a estrutura do ${nichoFormatado}! Uma dúvida rápida: vocês já têm uma página de alta conversão própria para captar clientes no Google ou hoje dependem apenas do Instagram e indicações?`
          },
          {
            id: 'ab-2',
            title: 'Abordagem com Diagnóstico de Oportunidade',
            text: `Olá${leadName.trim() ? ` ${nomeFormatado}` : ''}! Estava pesquisando empresas de ${nichoFormatado} na região e notei que muitos clientes procuram esse serviço no Google e não encontram uma página direta de agendamento de vocês. Eu crio estruturas digitais expressas com botão direto pro WhatsApp e consigo te mostrar uma prévia pronta para o ${nichoFormatado} ainda hoje. Posso te mandar aqui sem compromisso?`
          },
          {
            id: 'ab-3',
            title: 'Para Quem Quer Iniciar no Digital / Afiliados / Agências',
            text: `${saudacaoNome} Vi que você está no corre do marketing digital. Você já tem uma estrutura própria rodando no automático ou ainda perde horas tentando montar páginas e prospectar clientes manualmente?`
          }
        ]
      },
      {
        id: 'apresentacao',
        category: '2. Apresentação Rápida (Pitch de Valor)',
        icon: <Zap className="w-5 h-5 text-amber-400" />,
        color: 'border-amber-500/30 bg-amber-500/5',
        badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        items: [
          {
            id: 'ap-1',
            title: 'Pitch de 30 Segundos (Venda de Site para Cliente Local)',
            text: `Funciona assim: nós desenvolvemos uma Landing Page ultra-rápida e moderna para o ${nichoFormatado}, já integrada com botão flutuante de WhatsApp, carregamento instantâneo no celular e design focado em transformar visitantes em orçamentos reais.\n\nO melhor é que entregamos tudo hospedado e pronto para rodar em tempo recorde, sem você precisar ter dor de cabeça técnica.`
          },
          {
            id: 'ap-2',
            title: 'Pitch de 30 Segundos (Apresentação do SaaS GhostMarket AI)',
            text: `Basicamente nós temos uma máquina completa: o GhostMarket AI. Ele gera páginas de vendas profissionais em segundos usando Inteligência Artificial, hospeda gratuitamente com link próprio e ainda varre o Google Maps atrás de empresas reais para você vender esses sites de R$ 500 a R$ 1.500 cada.\n\nDá uma olhada na demonstração por dentro: ${demoUrl}`
          }
        ]
      },
      {
        id: 'objecao',
        category: '3. Quebra de Objeção (Tá Caro / Vou Pensar)',
        icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
        color: 'border-rose-500/30 bg-rose-500/5',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        items: [
          {
            id: 'ob-1',
            title: 'Objeção: "Está sem orçamento / Está caro"',
            text: `Eu te entendo perfeitamente${leadName.trim() ? `, ${nomeFormatado}` : ''}! Mas pensa comigo: quantos clientes novos você precisa fechar no ${nichoFormatado} para pagar esse valor? Geralmente 1 ou 2 clientes que cheguem pela sua nova página já pagam todo o investimento e o restante do ano inteiro é lucro puro no seu bolso. Bora colocar essa estrutura no ar ainda hoje?`
          },
          {
            id: 'ob-2',
            title: 'Objeção SaaS: "Vou pensar e te falo"',
            text: `Tranquilo! Só um aviso tático: essa condição especial está liberada por tempo limitado para esta turma. Se você fechar apenas UM único site usando nosso Scanner de Leads cobrando R$ 350, você já multiplica o valor investido na ferramenta. Se quiser garantir sua vaga com todos os bônus e Grupo VIP, a hora é agora!`
          }
        ]
      },
      {
        id: 'followup',
        category: '4. Follow-up (Recuperação de Vendas)',
        icon: <Clock className="w-5 h-5 text-emerald-400" />,
        color: 'border-emerald-500/30 bg-emerald-500/5',
        badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        items: [
          {
            id: 'fu-1',
            title: 'Follow-up de 24h (Visualizou e sumiu)',
            text: `Opa${leadName.trim() ? `, ${nomeFormatado}` : ''}, bom dia! Sei que a correria no ${nichoFormatado} é grande. Passando só para saber se você conseguiu ver a proposta que te enviei ontem ou se ficou alguma dúvida. Ainda tenho 1 horário na agenda desta semana para entregar sua página pronta!`
          },
          {
            id: 'fu-2',
            title: 'Follow-up de Novidade (Reaquecimento)',
            text: `Fala${leadName.trim() ? ` ${nomeFormatado}` : ''}! Passando rápido pra te avisar que acabamos de liberar novas ferramentas lá dentro da área de membros hoje (incluindo o Scanner de Leads e o AI Code Workspace). Conseguiu dar uma olhada no link que te mandei ou ficou alguma dúvida na hora de acessar?`
          }
        ]
      },
      {
        id: 'fechamento',
        category: '5. Fechamento Direto (PIX / Ativação)',
        icon: <DollarSign className="w-5 h-5 text-purple-400" />,
        color: 'border-purple-500/30 bg-purple-500/5',
        badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        items: [
          {
            id: 'fe-1',
            title: 'Fechamento de Site (50% Entrada + 50% na Entrega)',
            text: `Perfeito${leadName.trim() ? `, ${nomeFormatado}` : ''}! Para iniciarmos a criação da estrutura do ${nichoFormatado} hoje mesmo, trabalhamos de forma super transparente: 50% de entrada para reserva de agenda e início imediato, e os outros 50% somente quando você aprovar o site no ar. Prefere fazer via PIX ou cartão?`
          }
        ]
      }
    ],
    [saudacaoNome, nomeFormatado, leadName, nichoFormatado, demoUrl]
  )

  const filteredSections = useMemo(() => {
    if (activeCategory === 'all') return scripts
    return scripts.filter(s => s.id === activeCategory)
  }, [scripts, activeCategory])

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-accent/25 to-indigo-600/20 border border-accent/30 flex items-center justify-center shadow-[0_0_25px_rgba(139,92,246,0.25)] shrink-0">
            <MessageCircle className="w-6 h-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">Scripts X1 de Alta Conversão</h1>
            <p className="text-gray-400 text-sm mt-1">
              Personalize em tempo real, copie com 1 clique ou dispare direto para o WhatsApp do seu lead.
            </p>
          </div>
        </div>
      </div>

      {/* Personalizador Dinâmico de Lead */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0E0E11] p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Personalizador Automático de Variáveis (1 Clique)</span>
          </div>

          {(contracts.length > 0 || recentScannerLeads.length > 0) && (
            <select
              onChange={(e) => handleImportLeadOption(e.target.value)}
              defaultValue=""
              className="px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-semibold text-white outline-none focus:border-emerald-500"
            >
              <option value="" disabled>
                ⚡ Importar Lead do CRM ou Scanner Recente...
              </option>
              {contracts.length > 0 && (
                <optgroup label="Leads Salvos no CRM">
                  {contracts.map((c) => (
                    <option key={c.id} value={`crm:${c.id}`}>
                      {c.client} ({c.niche || 'CRM'})
                    </option>
                  ))}
                </optgroup>
              )}
              {recentScannerLeads.length > 0 && (
                <optgroup label="Última Varredura do Scanner">
                  {recentScannerLeads.map((l: any, idx: number) => (
                    <option key={idx} value={`scan:${idx}`}>
                      {l.name} ({l.category || 'Scanner'})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="relative">
            <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={leadName}
              onChange={e => setLeadName(e.target.value)}
              placeholder="Nome do Lead (ex: Marcos)"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/50 border border-white/10 focus:border-accent text-sm text-white placeholder:text-gray-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Briefcase className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={leadNiche}
              onChange={e => setLeadNiche(e.target.value)}
              placeholder="Nicho ou Empresa (ex: Clínica Odonto)"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/50 border border-white/10 focus:border-accent text-sm text-white placeholder:text-gray-500 focus:outline-none transition-colors"
            />
          </div>

          <div className="relative">
            <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
            <input
              type="tel"
              value={leadPhone}
              onChange={e => setLeadPhone(e.target.value)}
              placeholder="WhatsApp com DDD (para envio direto)"
              className="w-full h-11 pl-10 pr-4 rounded-xl bg-black/50 border border-white/10 focus:border-emerald-500 text-sm text-white placeholder:text-gray-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'Todos os Scripts' },
          { id: 'abordagem', label: '1. Abordagem Fria' },
          { id: 'apresentacao', label: '2. Pitch & Apresentação' },
          { id: 'objecao', label: '3. Quebra de Objeções' },
          { id: 'followup', label: '4. Follow-up' },
          { id: 'fechamento', label: '5. Fechamento & PIX' }
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-accent text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                : 'bg-white/[0.04] text-gray-400 hover:text-white hover:bg-white/[0.08] border border-white/[0.06]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Scripts Sections */}
      <div className="space-y-8">
        {filteredSections.map((section, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06 }}
            key={section.id}
            className={`rounded-2xl border p-5 sm:p-6 ${section.color}`}
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 rounded-xl bg-black/40 border border-white/10">{section.icon}</div>
              <h2 className="text-lg sm:text-xl font-bold text-white">{section.category}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map(item => {
                const isCopied = copiedId === item.id
                return (
                  <div
                    key={item.id}
                    className="bg-[#0b0913] border border-white/[0.08] hover:border-accent/40 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      </div>
                      <div className="bg-[#050507] border border-white/[0.06] p-4 rounded-xl font-sans text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">
                        {item.text}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 mt-4 pt-3 border-t border-white/[0.06]">
                      <button
                        onClick={() => copyToClipboard(item.text, item.id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500 text-black'
                            : 'bg-accent/15 hover:bg-accent text-accent hover:text-white border border-accent/30'
                        }`}
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        <span>{isCopied ? 'Copiado!' : 'Copiar Script'}</span>
                      </button>

                      <button
                        onClick={() => sendToWhatsApp(item.text)}
                        className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-[#25D366]/15 hover:bg-[#25D366] text-[#25D366] hover:text-black border border-[#25D366]/30 transition-all cursor-pointer"
                        title="Abrir direto no WhatsApp"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar no Zap</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
