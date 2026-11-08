import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  X,
  User,
  Sparkles,
  ChevronRight,
  Copy,
  Check,
  Flame,
  DollarSign,
  HelpCircle
} from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
  copyableScript?: string
}

const OBJECTIONS = [
  {
    id: 'obj-caro',
    label: '💸 "Achei caro / Está fora do orçamento"',
    script:
      'Entendo perfeitamente! Inclusive, justamente por pensar no seu caixa que estruturei esse formato: um único cliente novo que feche pelo site já paga todo o projeto — e todo o resto do ano é lucro limpo no seu bolso. Se eu parcelar a entrada ou dividir em 2x no PIX (50% agora e 50% na entrega com o seu Painel Admin funcionando), conseguimos ativar o seu domínio hoje?'
  },
  {
    id: 'obj-socio',
    label: '🤝 "Vou conversar com meu sócio primeiro"',
    script:
      'Perfeito! Para facilitar a conversa com ele e vocês não precisarem decidir no escuro: já deixei o link da prévia funcionando com o nome da empresa de vocês e o Painel Admin onde vocês mesmos alteram preços e produtos. Quer que eu gere um resumo em PDF de 1 página com os números para você encaminhar no WhatsApp dele agora?'
  },
  {
    id: 'obj-insta',
    label: '📸 "Já tenho Instagram, não preciso de site"',
    script:
      'O Instagram é excelente para vitrine, mas quem pesquisa no Google agora ("perto de mim") já está com o cartão na mão pronto para comprar — e hoje esses clientes estão caindo nos seus concorrentes. Além disso, com o site + cardápio/catálogo e Painel Admin próprio, o cliente já escolhe tudo sozinho e chega no seu WhatsApp com o pedido pronto, sem tomar tempo da sua equipe!'
  },
  {
    id: 'obj-mes',
    label: '🗓️ "Vamos deixar para o mês que vem"',
    script:
      'Sem problemas! Só te aviso porque como eu já montei toda a estrutura visual da sua empresa hoje para te demonstrar, consigo segurar essa condição sem taxa de montagem apenas até amanhã. Se a gente ativar hoje e deixar o segundo pagamento para o dia 10 do mês que vem, fica bom para você?'
  },
  {
    id: 'obj-sobrinho',
    label: '🧑‍💻 "Conheço alguém que faz mais barato"',
    script:
      'Totalmente compreensível! A grande diferença é que aqui você não está comprando apenas uma página solta que dá dor de cabeça depois: você já recebe o site hospedado em servidor de alta velocidade + Painel Administrativo Criptografado próprio para trocar preços, pausar itens esgotados e ativar promoções em 1 clique pelo celular. E eu já te entrego tudo rodando hoje mesmo!'
  }
]

const PRICING_GUIDE = [
  {
    niche: '🍔 Hamburgueria, Pizzaria & Delivery',
    setup: 'R$ 690 a R$ 1.200',
    monthly: 'R$ 97/mês',
    argument:
      'Destaque que ele economiza até 27% de taxa dos aplicativos de delivery recebendo os pedidos direto no WhatsApp + Painel Admin para pausar itens esgotados.'
  },
  {
    niche: '💈 Barbearia, Salão & Estética',
    setup: 'R$ 790 a R$ 1.400',
    monthly: 'R$ 97/mês',
    argument:
      'Mostre o agendamento rápido pelo WhatsApp e o selo ao vivo "Agenda Aberta / Últimos Horários" que o dono controla pelo Painel.'
  },
  {
    niche: '🦷 Clínica Médica & Odontológica',
    setup: 'R$ 1.200 a R$ 2.200',
    monthly: 'R$ 147/mês',
    argument:
      '1 único tratamento fechado (implante, harmonização, lente) já paga 3x o valor do site inteiro.'
  },
  {
    niche: '⚖️ Advocacia, Contabilidade & Seguros',
    setup: 'R$ 1.100 a R$ 1.900',
    monthly: 'R$ 120/mês',
    argument:
      'Foque em autoridade executiva no Google e triagem imediata de clientes qualificados no WhatsApp.'
  }
]

const PLATFORM_FAQS = [
  {
    id: 'q1',
    question: 'Como funciona o Painel Admin do Cliente (Lojista)?',
    answer:
      'No **GhostStudio (/builder)** ou em **Meus Sites (/sites)**, você define um Login e Senha para o seu cliente (protegidos por criptografia SHA-256). O cliente acessa **/painel/nome-do-site** e altera preços, promoções e status Aberto/Fechado em tempo real!'
  },
  {
    id: 'q2',
    question: 'Qual o jeito mais rápido de fechar a 1ª venda hoje?',
    answer:
      '1. Abra o **Scanner de Leads** e filtre por **Sem Site**.\n2. Clique em **Studio Site** no card da empresa para gerar o site dela em 10 segundos.\n3. Publique o link e mande no WhatsApp do dono mostrando a prévia pronta!'
  },
  {
    id: 'q3',
    question: 'Como gero Proposta ou Contrato com CNPJ?',
    answer:
      'Consulte a empresa na aba **Dossiê CNPJ** e clique em **Gerar Proposta/Contrato PDF**, ou acesse direto a aba **Proposta & Contrato PDF (/proposta)** no menu lateral.'
  }
]

export const CopilotChat = () => {
  const { addToast } = useToastStore()
  const [isOpen, setIsOpen] = useState(false)
  const [activeMode, setActiveMode] = useState<'objections' | 'pricing' | 'faq'>('objections')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Fala, Closer! Sou seu **Copiloto Comercial**. Escolha uma objeção abaixo para copiar a resposta exata ou consulte a tabela de preços por nicho:',
      sender: 'ai'
    }
  ])
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleObjectionClick = (obj: (typeof OBJECTIONS)[number]) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      text: `Cliente disse: ${obj.label}`,
      sender: 'user'
    }
    const aiMsg: Message = {
      id: `a-${Date.now() + 1}`,
      text: `Aqui está o script exato para quebrar essa objeção e conduzir para o fechamento:`,
      sender: 'ai',
      copyableScript: obj.script
    }
    setMessages(prev => [...prev, userMsg, aiMsg])
  }

  const handleFaqClick = (faq: (typeof PLATFORM_FAQS)[number]) => {
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      text: faq.question,
      sender: 'user'
    }
    const aiMsg: Message = {
      id: `a-${Date.now() + 1}`,
      text: faq.answer,
      sender: 'ai'
    }
    setMessages(prev => [...prev, userMsg, aiMsg])
  }

  const copyScript = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    addToast('Resposta copiada! Cole no WhatsApp do cliente.', 'success')
    setTimeout(() => setCopiedId(null), 2000)
  }

  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="text-white">
            {part.slice(2, -2)}
          </strong>
        )
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="h-13 px-4 rounded-full shadow-[0_12px_35px_rgba(16,185,129,0.3)] bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
            >
              <Bot className="w-5 h-5" />
              <span className="hidden sm:inline">Copiloto Closer</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] sm:w-[420px] h-[630px] max-h-[86dvh] flex flex-col bg-[#0E0E11] border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#09090B] border-b border-zinc-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Copiloto de Fechamento X1</h3>
                  <p className="text-[11px] text-emerald-400 font-medium">
                    Quebra de Objeções & Tabela de Preços
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-3 gap-1 p-1.5 bg-[#09090B] border-b border-zinc-800 shrink-0">
              <button
                type="button"
                onClick={() => setActiveMode('objections')}
                className={`py-2 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeMode === 'objections'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5" />
                <span>Objeções</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('pricing')}
                className={`py-2 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeMode === 'pricing'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Quanto Cobrar</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveMode('faq')}
                className={`py-2 px-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  activeMode === 'faq'
                    ? 'bg-emerald-500 text-zinc-950'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Ajuda</span>
              </button>
            </div>

            {activeMode === 'pricing' ? (
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#09090B]/50">
                <p className="text-xs text-zinc-400">
                  Valores recomendados para cobrar por <strong>Site + Painel Admin do Lojista</strong>:
                </p>
                {PRICING_GUIDE.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-[#0E0E11] border border-zinc-800 space-y-2"
                  >
                    <div className="font-bold text-xs text-white">{item.niche}</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-[#09090B] border border-zinc-800/80">
                        <span className="block text-[10px] text-zinc-500 uppercase font-mono">
                          Criação (Setup)
                        </span>
                        <strong className="text-xs text-emerald-400">{item.setup}</strong>
                      </div>
                      <div className="p-2 rounded-lg bg-[#09090B] border border-zinc-800/80">
                        <span className="block text-[10px] text-zinc-500 uppercase font-mono">
                          Mensalidade
                        </span>
                        <strong className="text-xs text-white">{item.monthly}</strong>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      💡 <strong>Argumento:</strong> {item.argument}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {/* Messages History */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#09090B]/40">
                  {messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`flex gap-2.5 max-w-[92%] ${
                          msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            msg.sender === 'user'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                          }`}
                        >
                          {msg.sender === 'user' ? (
                            <User className="w-3.5 h-3.5" />
                          ) : (
                            <Bot className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-xl text-xs leading-relaxed space-y-2 ${
                            msg.sender === 'user'
                              ? 'bg-emerald-500 text-zinc-950 font-semibold rounded-tr-xs'
                              : 'bg-[#0E0E11] border border-zinc-800 text-zinc-300 rounded-tl-xs'
                          }`}
                        >
                          <div>{renderText(msg.text)}</div>
                          {msg.copyableScript && (
                            <div className="p-2.5 rounded-lg bg-[#09090B] border border-zinc-800 text-zinc-200 space-y-2">
                              <p className="text-xs italic leading-relaxed">
                                "{msg.copyableScript}"
                              </p>
                              <button
                                type="button"
                                onClick={() => copyScript(msg.copyableScript!, msg.id)}
                                className="w-full py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                {copiedId === msg.id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5" />
                                    <span>Copiar Resposta p/ WhatsApp</span>
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Triggers Footer */}
                <div className="p-3 bg-[#09090B] border-t border-zinc-800 flex flex-col gap-1.5 overflow-y-auto max-h-[42%] shrink-0">
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-0.5">
                    {activeMode === 'objections'
                      ? 'Qual objeção o cliente mandou?'
                      : 'Dúvidas Rápidas da Plataforma'}
                  </p>
                  {activeMode === 'objections'
                    ? OBJECTIONS.map(obj => (
                        <button
                          key={obj.id}
                          type="button"
                          onClick={() => handleObjectionClick(obj)}
                          className="flex items-center justify-between text-left w-full p-2.5 bg-[#0E0E11] border border-zinc-800/90 rounded-xl hover:border-emerald-500/40 transition-all group cursor-pointer"
                        >
                          <span className="text-xs font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">
                            {obj.label}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 shrink-0" />
                        </button>
                      ))
                    : PLATFORM_FAQS.map(faq => (
                        <button
                          key={faq.id}
                          type="button"
                          onClick={() => handleFaqClick(faq)}
                          className="flex items-center justify-between text-left w-full p-2.5 bg-[#0E0E11] border border-zinc-800/90 rounded-xl hover:border-emerald-500/40 transition-all group cursor-pointer"
                        >
                          <span className="text-xs font-medium text-zinc-200 group-hover:text-emerald-400 transition-colors">
                            {faq.question}
                          </span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 shrink-0" />
                        </button>
                      ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
