import { GlassTerminal } from '@/components/ui/GlassTerminal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PillSelector } from '@/components/ui/PillSelector'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Copy, Check, PlayCircle, ChevronRight, ChevronLeft } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'

export const ViralScripts = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(1)
  const { addToast } = useToastStore()

  const [formData, setFormData] = useState({
    productName: '',
    targetAudience: '',
    hookType: 'Curiosidade',
    videoLength: '15 a 30 segundos'
  })

  const HOOKS = ['Curiosidade', 'Polêmica', 'Dor Forte', 'Humor', 'Prova Social (Resultado)']
  const LENGTHS = ['15 a 30 segundos', '30 a 60 segundos', 'Mais de 1 minuto']

  const generateScript = async () => {
    if (!formData.productName) {
      addToast('Digite o nome do produto', 'error')
      return
    }

    setIsGenerating(true)
    setStep(5)
    addToast('A IA está roteirizando seu vídeo viral...', 'success')

    const prompt = `Você é o maior especialista em TikTok Orgânico e Reels.
Crie um roteiro de vídeo viral para o produto "${formData.productName}".
Público Alvo: ${formData.targetAudience || 'Geral'}
Duração: ${formData.videoLength}
Tipo de Gancho (Primeiros 3s): ${formData.hookType}

ESTRUTURA OBRIGATÓRIA DO ROTEIRO:
1. HOOK (0-3s): [Fala + Ação visual impactante]
2. RETENÇÃO (3-15s): [Desenvolvimento do problema + Solução com o produto]
3. CTA (Fim): [Chamada para ação clara pro link da bio ou botão]

Formate de forma limpa. Faça o texto dinâmico, rápido, estilo "UGC" (User Generated Content).
Escreva a [CENA VISUAL] e o [ÁUDIO/FALA].`

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          model: 'openai'
        })
      })

      if (!response.ok) throw new Error('API Error')
      const text = await response.text()
      if (!text) throw new Error('Vazio')
      setGeneratedScript(text)
      addToast('Roteiro gerado com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      setGeneratedScript('Ops, erro no servidor. Tente novamente.')
      addToast('Erro ao gerar', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast('Roteiro copiado!', 'success')
  }

  const nextStep = () => setStep(s => Math.min(5, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto space-y-6 pt-10 pb-20 relative z-10 min-h-screen">
        
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <PlayCircle className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-indigo-400 mb-4">
            Roteiros Virais
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl font-medium">
            Domine o TikTok e Reels com roteiros dinâmicos e que prendem a atenção.
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
                    <h2 className="text-3xl font-black text-white">Duração do Vídeo</h2>
                    <p className="text-textSecondary">Quanto tempo deve durar o conteúdo?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="videoLength" 
                      options={LENGTHS} 
                      value={formData.videoLength} 
                      onChange={(val) => setFormData(p => ({ ...p, videoLength: val }))} 
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
                    <h2 className="text-3xl font-black text-white">O Hook (Gancho)</h2>
                    <p className="text-textSecondary">Qual gatilho vai prender a atenção nos primeiros 3s?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="hookType" 
                      options={HOOKS} 
                      value={formData.hookType} 
                      onChange={(val) => setFormData(p => ({ ...p, hookType: val }))} 
                    />
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

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 3 de 5</h3>
                    <h2 className="text-3xl font-black text-white">Sobre o Produto</h2>
                    <p className="text-textSecondary">O que vamos vender ou divulgar?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Nome / Descrição"
                      value={formData.productName}
                      onChange={(e) => setFormData(p => ({ ...p, productName: e.target.value }))}
                      placeholder="Ex: Treinamento Desafio 21 Dias..."
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={nextStep} disabled={!formData.productName} className="flex-1 h-14 text-lg font-bold">
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
                    <h2 className="text-3xl font-black text-white">O Público</h2>
                    <p className="text-textSecondary">Para quem estamos falando? (Opcional)</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Público Alvo"
                      value={formData.targetAudience}
                      onChange={(e) => setFormData(p => ({ ...p, targetAudience: e.target.value }))}
                      placeholder="Ex: Jovens mães de 25 a 35 anos"
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={generateScript} className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryLight hover:to-indigo-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                      <PlayCircle className="w-5 h-5 mr-2" /> Roteirizar Vídeo
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
                  <h3 className="text-xl font-bold text-white mb-2">Roteiro TikTok & Reels</h3>
                  <p className="text-textSecondary">Pronto para gravar. É só ler e faturar.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="font-bold">
                    Refazer
                  </Button>
                  <Button onClick={copyToClipboard} className="bg-primary hover:bg-primaryLight font-bold">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado!' : 'Copiar Roteiro'}
                  </Button>
                </div>
              </div>
              
              <div className="rounded-xl border border-border/50 bg-panel/50 backdrop-blur-md shadow-2xl overflow-hidden p-2">
                {isGenerating ? (
                  <div className="h-[400px] flex flex-col items-center justify-center text-textSecondary gap-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-t-primary border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-primary border-l-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                      <PlayCircle className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-lg font-medium animate-pulse text-white">Criando retenção absurda...</p>
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
