import { GlassTerminal } from '@/components/ui/GlassTerminal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PillSelector } from '@/components/ui/PillSelector'
import { useState } from 'react'
import { MessageSquare, Copy, Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'
import { motion, AnimatePresence } from 'framer-motion'

export const Creator = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  
  const [step, setStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [copied, setCopied] = useState(false)

  const [formData, setFormData] = useState({
    type: 'Abertura',
    clientName: '',
    niche: '',
    product: '',
    offer: '',
    tone: 'Persuasivo',
    followUpReason: 'Visualizou e não respondeu'
  })

  const TONES = ['Persuasivo', 'Direto', 'Amigável']
  const REASONS = ['Visualizou e não respondeu', 'Achou caro', 'Pediu pra ver depois']

  const generateScript = () => {
    setIsGenerating(true)
    setStep(5)
    
    setTimeout(async () => {
      const { type, clientName, niche, product, offer, tone, followUpReason } = formData
      
      const firstName = clientName ? clientName.split(' ')[0] : 'Empreendedor'
      const nicheText = niche ? niche.toLowerCase() : 'negócio'
      
      let script = ''

      if (type === 'Abertura') {
        if (tone === 'Persuasivo') {
          script = `Fala ${firstName}, tudo bem?\\n\\nEstava analisando algumas empresas do setor de ${nicheText} aqui na região e o perfil de vocês me chamou muita atenção. Percebi um detalhe na estratégia de vocês que está deixando muito dinheiro na mesa.\\n\\nNós ajudamos empresas exatamente como a sua através de ${product || 'nossa solução'}, e o resultado costuma ser brutal na atração de novos clientes.\\n\\n${offer ? `Para você ter uma ideia, ${offer}.` : 'Temos uma estratégia pronta que eu gostaria de te apresentar.'}\\n\\nVocê teria 5 minutinhos amanhã à tarde para eu te mostrar como isso funcionaria no seu negócio, sem compromisso?`
        } else if (tone === 'Direto') {
          script = `Olá ${firstName}, vi que vocês têm um ${nicheText} de muito potencial.\\n\\nTrabalho com ${product || 'marketing e tecnologia'} e criei um plano de ação rápido que pode dobrar seus resultados nos próximos 30 dias.\\n\\n${offer ? `A nossa proposta é a seguinte: ${offer}.` : 'Se fizer sentido, podemos marcar uma call super rápida.'}\\n\\nComo está sua agenda para amanhã?`
        } else if (tone === 'Amigável') {
          script = `Opa ${firstName}, tudo joia?\\n\\nAcompanho o trabalho de vocês e acho fantástico o que estão construindo com o ${nicheText}! 👏\\n\\nEu ajudo empresas do seu setor com ${product || 'estratégias de crescimento'} e lembrei de vocês na hora. ${offer ? `Nós estamos com uma oportunidade muito legal: ${offer}.` : 'Gostaria muito de trocar uma ideia rápida para te mostrar como podemos ajudar.'}\\n\\nFaz sentido batermos um papo rápido na semana que vem? Abraço!`
        }
      } else {
        if (followUpReason === 'Visualizou e não respondeu') {
          script = `Opa ${firstName}, tudo bem?\\n\\nSei que a correria do dia a dia no ${nicheText} é grande. Conseguiu dar uma olhada na proposta que te mandei sobre ${product || 'o nosso serviço'}?\\n\\nTemos apenas mais 2 vagas para implementar essa estratégia neste mês. Faz sentido darmos andamento ou prefere deixar para o próximo mês?`
        } else if (followUpReason === 'Achou caro') {
          script = `Fala ${firstName}, tudo bem?\\n\\nFiquei pensando no que conversamos sobre o investimento para o projeto de ${product || 'tecnologia'}.\\n\\nSei que o fluxo de caixa é prioridade pra vocês. Conversei com a equipe e consegui bolar uma alternativa: que tal começarmos com uma versão inicial focada apenas em gerar caixa rápido? ${offer ? `Nesse formato, podemos fazer por: ${offer}.` : 'Isso reduz o investimento inicial pela metade.'}\\n\\nO que acha de marcarmos 5 min para eu te mostrar esse novo escopo?`
        } else if (followUpReason === 'Pediu pra ver depois') {
          script = `Olá ${firstName}, como estão as coisas?\\n\\nDa última vez que nos falamos, você pediu para retomarmos o contato mais pra frente.\\n\\nNesse meio tempo, implementamos nossa estratégia de ${product || 'vendas'} em outro ${nicheText} e o resultado foi incrível.\\n\\nAinda faz sentido conversarmos sobre como aplicar isso no seu negócio?\\nAbraço!`
        }
      }

      setGeneratedScript(script)
      setIsGenerating(false)
      addToast('Script gerado com sucesso!', 'success')

      try {
        if (user?.email) {
          const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
          await addDoc(collection(db, 'ai_history'), {
            userId: user.email,
            type: type,
            niche: formData.niche || 'Geral',
            script: script,
            timestamp: serverTimestamp()
          })
        }
      } catch (err) {
        console.error("Erro ao salvar histrico:", err)
      }
    }, 1200)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript)
    setCopied(true)
    addToast('Copiado para a área de transferência!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const nextStep = () => setStep(s => Math.min(5, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto space-y-6 pt-10 pb-20 relative z-10 min-h-screen">
        
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <MessageSquare className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-indigo-400 mb-4">
            Creator IA
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl font-medium">
            Gere abordagens irresistíveis para WhatsApp. Converte frio em quente e quebra objeções.
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
                  : 'bg-panel border-background text-textSecondary'
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
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 1 de 5</h3>
                    <h2 className="text-3xl font-black text-white">Objetivo da Mensagem</h2>
                    <p className="text-textSecondary">É um primeiro contato ou resgate de lead frio?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="type" 
                      options={['Abertura', 'Follow-Up']} 
                      value={formData.type} 
                      onChange={(val) => setFormData(p => ({ ...p, type: val }))} 
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
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 2 de 5</h3>
                    <h2 className="text-3xl font-black text-white">Quem é o Cliente?</h2>
                    <p className="text-textSecondary">Detalhes básicos para gerar proximidade na copy.</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Nome do Cliente (ou Empresa)"
                      value={formData.clientName}
                      onChange={(e) => setFormData(p => ({ ...p, clientName: e.target.value }))}
                      placeholder="Ex: João Silva ou Barbearia do João"
                    />
                    <Input 
                      label="Qual o nicho dele?"
                      value={formData.niche}
                      onChange={(e) => setFormData(p => ({ ...p, niche: e.target.value }))}
                      placeholder="Ex: Clínicas de Estética, Restaurantes..."
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={nextStep} disabled={!formData.niche} className="flex-1 h-14 text-lg font-bold">
                      Avançar <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 3 de 5</h3>
                    <h2 className="text-3xl font-black text-white">A Solução</h2>
                    <p className="text-textSecondary">O que você está oferecendo?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Qual Serviço/Produto você vende?"
                      value={formData.product}
                      onChange={(e) => setFormData(p => ({ ...p, product: e.target.value }))}
                      placeholder="Ex: Assessoria de Tráfego, Criação de Sites..."
                    />
                    <Input 
                      label="Condição Especial / Benefício (Opcional)"
                      value={formData.offer}
                      onChange={(e) => setFormData(p => ({ ...p, offer: e.target.value }))}
                      placeholder="Ex: Criação do site sem custo de adesão"
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={nextStep} disabled={!formData.product} className="flex-1 h-14 text-lg font-bold">
                      Avançar <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 4 de 5</h3>
                    <h2 className="text-3xl font-black text-white">O Tom da Conversa</h2>
                    <p className="text-textSecondary">Como devemos estruturar a abordagem psicológica?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    {formData.type === 'Abertura' ? (
                      <PillSelector 
                        id="tone" 
                        options={TONES} 
                        value={formData.tone} 
                        onChange={(val) => setFormData(p => ({ ...p, tone: val }))} 
                      />
                    ) : (
                      <PillSelector 
                        id="reason" 
                        options={REASONS} 
                        value={formData.followUpReason} 
                        onChange={(val) => setFormData(p => ({ ...p, followUpReason: val }))} 
                      />
                    )}
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={generateScript} className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryLight hover:to-indigo-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                      <MessageSquare className="w-5 h-5 mr-2" /> Gerar Mensagem Pronta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Mensagem Pronta</h3>
                  <p className="text-textSecondary">Apenas copie e cole no WhatsApp do cliente.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="font-bold">
                    Refazer
                  </Button>
                  <Button onClick={copyToClipboard} className="bg-primary hover:bg-primaryLight font-bold">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado!' : 'Copiar Mensagem'}
                  </Button>
                </div>
              </div>
              
              <div className="rounded-xl border border-border/50 bg-panel/50 backdrop-blur-md shadow-2xl overflow-hidden p-2">
                {isGenerating ? (
                  <div className="h-[400px] flex flex-col items-center justify-center text-textSecondary gap-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-t-primary border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-primary border-l-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                      <MessageSquare className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-lg font-medium animate-pulse text-white">Escrevendo roteiro de vendas...</p>
                  </div>
                ) : (
                  <div className="h-[400px] w-full">
                    <GlassTerminal content={generatedScript || ''} />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
