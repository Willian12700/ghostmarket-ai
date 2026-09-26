import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PillSelector } from '@/components/ui/PillSelector'
import { useState, useEffect } from 'react'
import { Plus, MessageSquare, Edit2, Trash2, Save, X, Bot, Palette, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
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
  role?: string
}

export const Chatbots = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  
  const [bots, setBots] = useState<ChatbotConfig[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  
  const processingSteps = [
    "Inicializando Núcleo Cognitivo...",
    "Estruturando Comportamento ({role})...",
    "Injetando Prompt de Sistema...",
    "Compilando Identidade Visual...",
    "Ativando Atendente IA..."
  ];

  const handleSaveWithAI = async () => {
    setIsProcessing(true);
    setProcessingStep(0);
    
    // Simulate AI loading steps
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      await new Promise(r => setTimeout(r, 600)); // 600ms per step
    }
    
    await handleSave();
    setIsProcessing(false);
  }

  
  // Form State
  const [formData, setFormData] = useState({
    role: 'Vendedor',
    name: '',
    greeting: 'Olá! Como posso te ajudar hoje?',
    systemPrompt: '',
    primaryColor: '#8B5CF6'
  })

  const ROLES = ['Vendedor', 'Suporte ao Cliente', 'Captador de Leads', 'Personalizado']

  useEffect(() => {
    if (user) {
      fetchBots()
    }
  }, [user])

  // Update prompt based on role selection if empty or default
  useEffect(() => {
    if (formData.role === 'Vendedor') {
      setFormData(prev => ({...prev, systemPrompt: 'Você é um vendedor persuasivo. Seu objetivo é tirar as dúvidas do cliente rapidamente e conduzi-lo para a compra do produto de forma natural e amigável.'}))
    } else if (formData.role === 'Suporte ao Cliente') {
      setFormData(prev => ({...prev, systemPrompt: 'Você é um assistente de suporte gentil. Seu objetivo é resolver as dúvidas do cliente da melhor forma possível, sempre sendo muito educado.'}))
    } else if (formData.role === 'Captador de Leads') {
      setFormData(prev => ({...prev, systemPrompt: 'Você é um assistente focado em conversão. Seu objetivo é pegar o WhatsApp e E-mail do cliente o mais rápido possível para que um consultor humano possa entrar em contato.'}))
    } else if (formData.role === 'Personalizado' && !formData.systemPrompt) {
      setFormData(prev => ({...prev, systemPrompt: ''}))
    }
  }, [formData.role])

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

  const handleOpenWizard = (bot?: ChatbotConfig) => {
    if (bot) {
      setEditingId(bot.id!)
      setFormData({
        role: bot.role || 'Personalizado',
        name: bot.name,
        systemPrompt: bot.systemPrompt,
        greeting: bot.greeting,
        primaryColor: bot.primaryColor
      })
    } else {
      setEditingId(null)
      setFormData({
        role: 'Vendedor',
        name: '',
        systemPrompt: 'Você é um vendedor persuasivo. Seu objetivo é tirar as dúvidas do cliente rapidamente e conduzi-lo para a compra do produto de forma natural e amigável.',
        greeting: 'Olá! Como posso te ajudar hoje?',
        primaryColor: '#8B5CF6'
      })
    }
    setStep(1)
    setIsWizardOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.systemPrompt.trim()) {
      addToast('Nome e prompt são obrigatórios', 'error')
      return
    }

    setIsSaving(true)
    try {
      const botData = {
        name: formData.name,
        role: formData.role,
        systemPrompt: formData.systemPrompt,
        greeting: formData.greeting,
        primaryColor: formData.primaryColor,
        userId: user?.uid,
        updatedAt: serverTimestamp()
      }

      if (editingId) {
        await updateDoc(doc(db, 'chatbots', editingId), botData)
        addToast('Chatbot atualizado!', 'success')
      } else {
        await addDoc(collection(db, 'chatbots'), {
          ...botData,
          createdAt: serverTimestamp()
        })
        addToast('Chatbot criado!', 'success')
      }
      
      setIsWizardOpen(false)
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

  const nextStep = () => setStep(s => Math.min(5, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  if (isWizardOpen) {
    return (
      <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-background text-white selection:bg-primary/30">
        <AnimatedBackground />

      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <div className="max-w-md w-full bg-surface-elevated border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-surface">
                <motion.div 
                  className="h-full bg-accent"
                  initial={{ width: '0%' }}
                  animate={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" />
                <Bot className="w-10 h-10 text-accent animate-pulse" />
              </div>
              
              <h3 className="text-xl font-bold text-textPrimary mb-2">Construindo sua IA</h3>
              
              <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={processingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-accent font-medium"
                  >
                    {processingSteps[processingStep].replace('{role}', formData.role)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        <div className="max-w-4xl mx-auto space-y-6 pt-10 pb-20 relative z-10 min-h-screen">
          
          <div className="flex justify-between items-center mb-8 px-4">
            <Button variant="ghost" onClick={() => setIsWizardOpen(false)} className="text-textSecondary hover:text-white">
              <X className="w-5 h-5 mr-2" /> Cancelar
            </Button>
            <div className="text-sm font-bold text-primaryLight uppercase tracking-widest">
              {editingId ? 'Editando Chatbot' : 'Criando Chatbot'}
            </div>
            <div className="w-24"></div>
          </div>

          <div className="mb-12 flex flex-col items-center justify-center text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-indigo-400 mb-4">
              Arquiteto de IAs
            </h1>
            <p className="text-lg text-textSecondary max-w-2xl font-medium">
              Molde o comportamento do seu atendente virtual e injete nos seus sites.
            </p>
          </div>

          <div className="mb-12 relative max-w-2xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-border rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-primary to-indigo-500"
                initial={{ width: '0%' }}
                animate={{ width: `${((step - 1) / 4) * 100}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
            <div className="relative flex justify-between">
              {[1, 2, 3, 4, 5].map(i => (
                <motion.div 
                  key={i}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-4 transition-colors duration-500 ${
                    step >= i 
                    ? 'bg-primary border-panel text-white shadow-[0_0_15px_rgba(139,92,246,0.5)]' 
                    : 'bg-surface-elevated border-background text-textSecondary'
                  }`}
                >
                  {i}
                </motion.div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
                <Card className="border-border/50 bg-surface-elevated/50 backdrop-blur-sm shadow-2xl">
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 1 de 5</h3>
                      <h2 className="text-3xl font-black text-white">Objetivo Principal</h2>
                      <p className="text-textSecondary">O que esse Chatbot vai fazer no seu site?</p>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <PillSelector 
                        id="role" 
                        options={ROLES} 
                        value={formData.role} 
                        onChange={(val) => setFormData(p => ({ ...p, role: val }))} 
                      />
                    </div>

                    <div className="pt-6 border-t border-border/50">
                      <Button onClick={nextStep} className="w-full h-14 text-lg font-bold">
                        Avançar <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
                <Card className="border-border/50 bg-surface-elevated/50 backdrop-blur-sm shadow-2xl">
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 2 de 5</h3>
                      <h2 className="text-3xl font-black text-white">Perfil do Atendente</h2>
                      <p className="text-textSecondary">Dê um nome para a IA e defina as instruções do cérebro dela.</p>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <Input 
                        label="Nome do Atendente"
                        value={formData.name}
                        onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Ex: Júlia (Especialista de Vendas)"
                      />
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-textSecondary">Prompt do Sistema (O "Cérebro")</label>
                        <textarea 
                          value={formData.systemPrompt} 
                          onChange={e => setFormData(p => ({...p, systemPrompt: e.target.value}))} 
                          className="w-full bg-background border border-border rounded-lg p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary h-32 resize-none custom-scrollbar"
                          placeholder="Ex: Você é a Júlia, atendente da loja XYZ..."
                        />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/50 flex gap-4">
                      <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                      <Button onClick={nextStep} disabled={!formData.name} className="flex-1 h-14 text-lg font-bold">
                        Avançar <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
                <Card className="border-border/50 bg-surface-elevated/50 backdrop-blur-sm shadow-2xl">
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 3 de 5</h3>
                      <h2 className="text-3xl font-black text-white">A Primeira Impressão</h2>
                      <p className="text-textSecondary">Qual será a primeira mensagem quando o cliente abrir o chat?</p>
                    </div>
                    
                    <div className="space-y-4 pt-4">
                      <Input 
                        label="Mensagem de Boas-Vindas"
                        value={formData.greeting}
                        onChange={(e) => setFormData(p => ({ ...p, greeting: e.target.value }))}
                        placeholder="Ex: Olá! Precisa de ajuda com algum produto?"
                      />
                    </div>

                    <div className="pt-6 border-t border-border/50 flex gap-4">
                      <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                      <Button onClick={nextStep} disabled={!formData.greeting} className="flex-1 h-14 text-lg font-bold">
                        Avançar <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
                <Card className="border-border/50 bg-surface-elevated/50 backdrop-blur-sm shadow-2xl">
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 4 de 5</h3>
                      <h2 className="text-3xl font-black text-white">Identidade Visual</h2>
                      <p className="text-textSecondary">Personalize as cores do seu Chatbot para combinar com sua marca.</p>
                    </div>
                    
                    <div className="space-y-6 pt-4">
                      <div className="flex items-center gap-6">
                        <input 
                          type="color" 
                          value={formData.primaryColor} 
                          onChange={e => setFormData(p => ({ ...p, primaryColor: e.target.value }))} 
                          className="w-20 h-20 rounded-xl cursor-pointer bg-transparent border-0 p-0 shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                        />
                        <div className="space-y-2 flex-1">
                          <label className="text-sm font-medium text-textSecondary flex items-center gap-2">
                            <Palette className="w-4 h-4" /> Cor Principal (HEX)
                          </label>
                          <Input value={formData.primaryColor} onChange={e => setFormData(p => ({ ...p, primaryColor: e.target.value }))} className="uppercase font-mono tracking-widest" />
                        </div>
                      </div>

                      {/* Preview */}
                      <div className="bg-background rounded-xl p-6 border border-border mt-6">
                        <p className="text-sm text-textSecondary mb-4">Preview do Balão:</p>
                        <div className="flex justify-end">
                          <div className="p-3 px-4 rounded-2xl rounded-br-none text-white text-sm" style={{ backgroundColor: formData.primaryColor }}>
                            {formData.greeting}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-border/50 flex gap-4">
                      <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                      <Button onClick={nextStep} className="flex-1 h-14 text-lg font-bold">
                        Avançar <ChevronRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6 border border-green-500/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h2 className="text-3xl font-black text-white mb-4">Tudo Pronto!</h2>
                <p className="text-textSecondary mb-8 text-lg">
                  Sua IA está configurada e pronta para vender no automático. Clique abaixo para salvar e voltar à sua lista de Chatbots.
                </p>

                <div className="flex gap-4 max-w-md mx-auto">
                  <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                  <Button onClick={handleSaveWithAI} disabled={isProcessing || isSaving} className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryLight shadow-[0_0_20px_rgba(139,92,246,0.3)] text-white">
                    {isSaving ? <span className="animate-pulse">Salvando e Treinando IA...</span> : <><Save className="w-5 h-5 mr-2" /> Finalizar e Salvar</>}
                  </Button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    )
  }

  // LISTAGEM DE CHATBOTS DEFAULT SCREEN
  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-background text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="space-y-6 max-w-7xl mx-auto pt-10 pb-20 relative z-10 min-h-screen">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Bot className="w-8 h-8 text-primary" />
              Chatbots Inteligentes
            </h2>
            <p className="text-textSecondary mt-2">Seus assistentes virtuais baseados em IA. Injetáveis em sites hospedados.</p>
          </div>
          <Button onClick={() => handleOpenWizard()} className="shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-primary hover:bg-primaryLight text-white h-12 px-6 font-bold">
            <Plus className="w-5 h-5 mr-2" />
            Criar Nova IA
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>
        ) : bots.length === 0 ? (
          <Card className="border-dashed border-2 bg-surface border-border/50 mx-4 rounded-3xl">
            <CardContent className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <MessageSquare className="w-12 h-12 text-primary/50" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Nenhum Chatbot Criado</h3>
              <p className="text-textSecondary max-w-md mb-8 text-lg">Comece a construir seu primeiro atendente inteligente. Ele poderá ser injetado nos seus sites em um clique!</p>
              <Button onClick={() => handleOpenWizard()} size="lg" className="h-14 px-8 font-bold text-lg"><Plus className="w-5 h-5 mr-2"/> Começar Agora</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {bots.map(bot => (
              <Card key={bot.id} className="border-border bg-surface-elevated flex flex-col group hover:border-borderHover hover:-translate-y-1 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-glow-sm rounded-2xl">
                <div className="h-2 w-full" style={{ backgroundColor: bot.primaryColor || '#8B5CF6' }}></div>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: `${bot.primaryColor}20` }}>
                      <Bot className="w-5 h-5" style={{ color: bot.primaryColor }} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{bot.name}</h3>
                      <p className="text-xs text-textSecondary">{bot.role || 'Assistente'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenWizard(bot)} className="w-8 h-8 p-0">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(bot.id!)} className="w-8 h-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col gap-4 mt-2">
                  <div className="bg-background border border-border rounded-lg p-4 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-textSecondary mb-2">Comportamento Base:</p>
                    <p className="text-sm text-gray-300 line-clamp-3 leading-relaxed">{bot.systemPrompt}</p>
                  </div>

                  <div className="text-sm text-textSecondary bg-background rounded-lg p-3 border border-border truncate flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: bot.primaryColor }}></div>
                    <span className="truncate">{bot.greeting}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
