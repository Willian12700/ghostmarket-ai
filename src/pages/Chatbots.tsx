import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { useState, useEffect } from 'react'
import { Plus, MessageSquare, Edit2, Trash2, Save, X, Bot, Palette } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { motion, AnimatePresence } from 'framer-motion'

export interface ChatbotConfig {
  id?: string
  name: string
  systemPrompt: string
  greeting: string
  primaryColor: string
  userId: string
}

export const Chatbots = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  
  const [bots, setBots] = useState<ChatbotConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  const [editingBot, setEditingBot] = useState<ChatbotConfig | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [systemPrompt, setSystemPrompt] = useState('')
  const [greeting, setGreeting] = useState('Olá! Como posso te ajudar hoje?')
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (user) {
      fetchBots()
    }
  }, [user])

  const fetchBots = async () => {
    try {
      const q = query(collection(db, 'chatbots'), where('userId', '==', user?.uid))
      const snap = await getDocs(q)
      const fetched: ChatbotConfig[] = []
      snap.forEach(doc => {
        fetched.push({ id: doc.id, ...doc.data() } as ChatbotConfig)
      })
      setBots(fetched)
    } catch (error) {
      console.error(error)
      addToast('Erro ao carregar chatbots', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (bot?: ChatbotConfig) => {
    if (bot) {
      setEditingBot(bot)
      setName(bot.name)
      setSystemPrompt(bot.systemPrompt)
      setGreeting(bot.greeting)
      setPrimaryColor(bot.primaryColor)
    } else {
      setEditingBot(null)
      setName('')
      setSystemPrompt('Você é um assistente virtual gentil e prestativo. Seu objetivo é tirar dúvidas sobre nossos serviços e captar o contato do cliente.')
      setGreeting('Olá! Como posso te ajudar hoje?')
      setPrimaryColor('#8B5CF6')
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !systemPrompt.trim()) {
      addToast('Preencha o nome e o prompt', 'error')
      return
    }

    setIsSaving(true)
    try {
      const botData = {
        name,
        systemPrompt,
        greeting,
        primaryColor,
        userId: user?.uid,
        updatedAt: serverTimestamp()
      }

      if (editingBot?.id) {
        await updateDoc(doc(db, 'chatbots', editingBot.id), botData)
        addToast('Chatbot atualizado!', 'success')
      } else {
        await addDoc(collection(db, 'chatbots'), {
          ...botData,
          createdAt: serverTimestamp()
        })
        addToast('Chatbot criado!', 'success')
      }
      
      setIsModalOpen(false)
      fetchBots()
    } catch (error) {
      console.error(error)
      addToast('Erro ao salvar chatbot', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este Chatbot? Sites que já estão usando ele ficarão sem o chat.')) return
    
    try {
      await deleteDoc(doc(db, 'chatbots', id))
      addToast('Chatbot excluído', 'success')
      fetchBots()
    } catch (error) {
      console.error(error)
      addToast('Erro ao excluir', 'error')
    }
  }

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="space-y-6 max-w-7xl pb-10 relative z-10 min-h-screen pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Bot className="w-8 h-8 text-primary" />
            Chatbots Inteligentes
          </h2>
          <p className="text-textSecondary mt-2">Crie assistentes virtuais baseados em IA para injetar nos sites hospedados.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]">
          <Plus className="w-5 h-5 mr-2" />
          Criar Chatbot
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
      ) : bots.length === 0 ? (
        <Card className="border-dashed border-2 bg-background/50">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <MessageSquare className="w-16 h-16 text-borderHover mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Nenhum Chatbot Criado</h3>
            <p className="text-textSecondary max-w-md mb-6">Crie seu primeiro atendente inteligente. Você poderá injetá-lo automaticamente nos sites que você hospedar na plataforma!</p>
            <Button onClick={() => handleOpenModal()}>Começar Agora</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {bots.map((bot) => (
            <Card key={bot.id} className="hover:border-primary/50 transition-colors flex flex-col group">
              <CardContent className="p-6 flex-1 flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: bot.primaryColor }}>
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">{bot.name}</h3>
                      <p className="text-xs text-textSecondary">Atendente Virtual IA</p>
                    </div>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleOpenModal(bot)} className="p-2 text-textSecondary hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(bot.id!)} className="p-2 text-textSecondary hover:text-error transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <div className="bg-panel border border-border rounded-lg p-3 mb-4 flex-1">
                  <p className="text-xs font-medium text-textSecondary mb-1">Comportamento Base:</p>
                  <p className="text-sm text-gray-300 line-clamp-3">{bot.systemPrompt}</p>
                </div>

                <div className="text-xs text-textSecondary bg-background rounded-md p-2 border border-border truncate">
                  <span className="font-bold text-primary">Oi:</span> {bot.greeting}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Criar/Editar */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => !isSaving && setIsModalOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-panel border border-border w-full max-w-xl rounded-2xl shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
            >
              <div className="p-5 border-b border-border flex justify-between items-center">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  {editingBot ? 'Editar Chatbot' : 'Novo Chatbot'}
                </h3>
                <button onClick={() => !isSaving && setIsModalOpen(false)} className="text-textSecondary hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Nome do Atendente</label>
                  <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Assistente de Vendas" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Comportamento e Regras (Prompt)</label>
                  <textarea 
                    value={systemPrompt} 
                    onChange={e => setSystemPrompt(e.target.value)} 
                    className="w-full bg-background border border-border rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none custom-scrollbar"
                    placeholder="Ex: Você é a Júlia, atendente da loja XYZ. O frete custa R$20. Tente sempre convencer o cliente a fechar o pedido..."
                    required
                  />
                  <p className="text-xs text-textSecondary">A IA vai usar isso como o "Cérebro" para conversar com o cliente no site.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Mensagem de Boas-Vindas</label>
                  <Input value={greeting} onChange={e => setGreeting(e.target.value)} placeholder="Ex: Olá! Precisa de ajuda com algum produto?" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                    <Palette className="w-4 h-4" /> Cor do Chatbot (Balão e Botão)
                  </label>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={e => setPrimaryColor(e.target.value)} 
                      className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                    />
                    <Input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="w-32 uppercase" />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} disabled={isSaving}>Cancelar</Button>
                  <Button type="submit" disabled={isSaving} className="bg-primary hover:bg-primaryLight text-white">
                    {isSaving ? <span className="animate-pulse">Salvando...</span> : <><Save className="w-4 h-4 mr-2" /> Salvar Chatbot</>}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
    </div>
  )
}
