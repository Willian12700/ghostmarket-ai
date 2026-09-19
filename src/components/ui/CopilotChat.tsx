import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, User, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
}

const faqs = [
  {
    id: 'q1',
    question: "Como encontrar novos clientes?",
    answer: "Para prospectar clientes, acesse a aba **Scanner de Leads**! Lá você digita o seu nicho (ex: 'Pizzaria', 'Advogado') e a cidade. O sistema vai varrer o Google Maps e extrair o WhatsApp e informações das empresas para você."
  },
  {
    id: 'q2',
    question: "Como criar mensagens que vendem?",
    answer: "Acesse a aba **Creator IA**! Basta preencher o nicho do seu cliente e qual é a sua oferta. O sistema vai gerar scripts de vendas persuasivos (abertura e follow-up) prontos para você copiar e colar."
  },
  {
    id: 'q3',
    question: "Onde ficam meus textos gerados?",
    answer: "Todos os seus scripts criados ficam salvos automaticamente na aba **Biblioteca IA**. Lá você pode acessar, copiar ou apagar seu histórico a qualquer momento."
  },
  {
    id: 'q4',
    question: "Como organizar minhas vendas (CRM)?",
    answer: "Use a aba **CRM (Kanban)**. Lá você cadastra seus contatos e arrasta os cartões pelas colunas (Lead, Reunião, Fechado, Perdido). Assim você nunca esquece quem precisa de um retorno!"
  },
  {
    id: 'q5',
    question: "Como funciona o Dashboard?",
    answer: "O seu **Painel de Controle (Dashboard)** calcula o seu faturamento baseado nos contratos que você moveu para a coluna 'Fechado' no CRM. Quando você fecha uma venda lá, o dinheiro aparece aqui!"
  },
]

export const CopilotChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o seu Assistente do GhostMarket AI. Em que posso te ajudar hoje? Selecione uma dúvida abaixo:',
      sender: 'ai'
    }
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleFaqClick = (faq: typeof faqs[0]) => {
    const userMessage: Message = { id: Date.now().toString(), text: faq.question, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)

    // Simula o tempo de resposta da IA
    setTimeout(() => {
      setIsTyping(false)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: faq.answer,
        sender: 'ai'
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  // Função para renderizar o texto com negrito simples
  const renderText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-white">{part.slice(2, -2)}</strong>
      }
      return <span key={index}>{part}</span>
    })
  }

  return (
    <>
      {/* Floating Action Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              className="w-14 h-14 rounded-full shadow-[0_0_20px_rgba(124,58,237,0.3)] bg-primary hover:bg-primary-hover flex items-center justify-center relative overflow-hidden group"
              onClick={() => setIsOpen(true)}
            >
              <div className="absolute inset-0 bg-gradient-to-tr from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <Bot className="w-6 h-6 text-white relative z-10" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[600px] max-h-[85vh] flex flex-col bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-background border-b border-border flex items-center justify-between relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-textPrimary">Guia Rápido</h3>
                  <p className="text-xs text-primary font-medium">Assistente Virtual</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="relative z-10 p-2 text-textSecondary hover:text-textPrimary hover:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-background/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === 'user' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-textSecondary'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-sm' 
                        : 'bg-surface border border-border text-textSecondary rounded-tl-sm'
                    }`}>
                      {renderText(msg.text)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex gap-3 max-w-[85%] flex-row">
                    <div className="w-8 h-8 rounded-full bg-surface border border-border text-textSecondary flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-4 rounded-2xl rounded-tl-sm bg-surface border border-border flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-textSecondary/50 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-textSecondary/50 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-textSecondary/50 rounded-full animate-bounce"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FAQ Menu Area */}
            {!isTyping && (
              <div className="p-4 bg-background border-t border-border flex flex-col gap-2 overflow-y-auto max-h-[40%]">
                <p className="text-xs font-semibold text-textSecondary mb-1 uppercase tracking-wider">Perguntas Frequentes</p>
                {faqs.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleFaqClick(faq)}
                    className="flex items-center justify-between text-left w-full p-3 bg-surface border border-border rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                  >
                    <span className="text-sm font-medium text-textPrimary group-hover:text-primary transition-colors">
                      {faq.question}
                    </span>
                    <ChevronRight className="w-4 h-4 text-textSecondary group-hover:text-primary" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
