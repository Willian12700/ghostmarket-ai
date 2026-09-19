import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface Message {
  id: string
  text: string
  sender: 'user' | 'ai'
}

export const CopilotChat = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Olá! Sou o seu Copiloto GhostMarket AI. Como posso te ajudar a vender mais hoje?',
      sender: 'ai'
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simulando chamada de IA (aqui podemos conectar com a API da OpenAI/Gemini no futuro)
    setTimeout(() => {
      setIsTyping(false)
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Ótima pergunta! Para alavancar suas vendas, recomendo que você utilize nossa aba "Creator IA" para gerar copies persuasivas e o "Scanner de Leads" para encontrar novos clientes na sua região.',
        sender: 'ai'
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1500)
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
            className="fixed bottom-6 right-6 z-50 w-[350px] sm:w-[400px] h-[550px] max-h-[80vh] flex flex-col bg-surface border border-border shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-background border-b border-border flex items-center justify-between relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-50" />
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-textPrimary">IA Copiloto</h3>
                  <p className="text-xs text-primary font-medium">Online</p>
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
                  <div className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.sender === 'user' ? 'bg-primary/20 text-primary' : 'bg-surface border border-border text-textSecondary'
                    }`}>
                      {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`p-3 rounded-2xl text-sm ${
                      msg.sender === 'user' 
                        ? 'bg-primary text-white rounded-tr-sm' 
                        : 'bg-surface border border-border text-textPrimary rounded-tl-sm'
                    }`}>
                      {msg.text}
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

            {/* Input Area */}
            <div className="p-4 bg-background border-t border-border">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pergunte algo à IA..."
                  className="flex-1 rounded-full bg-surface"
                />
                <Button 
                  type="submit" 
                  disabled={!input.trim() || isTyping}
                  className="w-10 h-10 rounded-full p-0 flex items-center justify-center shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
