import { GlassTerminal } from '@/components/ui/GlassTerminal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PillSelector } from '@/components/ui/PillSelector'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Copy, Check, TrendingUp, ChevronRight, ChevronLeft } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'

export const AdCopy = () => {
  const [isGenerating, setIsGenerating] = useState(false)

  const [processingStep, setProcessingStep] = useState(0);
  
  const processingSteps = [
    "Analisando métricas do algoritmo...",
    "Estruturando ganchos persuasivos...",
    "Aplicando gatilhos mentais de {emotion}...",
    "Gerando variações de copy...",
    "Finalizando formatação..."
  ];

  const [generatedCopy, setGeneratedCopy] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(1)
  const { addToast } = useToastStore()

  const [formData, setFormData] = useState({
    productName: '',
    offer: '',
    approach: 'Urgência / Escassez',
    emotion: 'FOMO (Ficar de fora)',
    cta: 'Compre Agora'
  })

  const APPROACHES = [
    'Urgência / Escassez',
    'Benefício Direto',
    'Case de Sucesso',
    'Segredo / Polêmica',
    'Demonstração'
  ]

  const EMOTIONS = [
    'FOMO (Ficar de fora)',
    'Status / Vaidade',
    'Conforto / Segurança',
    'Ganância / Economia',
    'Alívio de Dor'
  ]

  const CTAS = ['Compre Agora', 'Saiba Mais', 'Aproveitar Oferta', 'Garantir Desconto']

  const generateAdCopy = async () => {
    if (!formData.productName) {
      addToast('Digite o nome do produto', 'error')
      return
    }

    setIsGenerating(true);
setProcessingStep(0);
for(let i=0; i<processingSteps.length; i++){ setProcessingStep(i); await new Promise(r => setTimeout(r, 600)); }
setStep(6);
    addToast('A IA está analisando o ângulo e escrevendo as copys...', 'success')

    const prompt = `Atue como o melhor Copywriter de TikTok e Reels Ads do Brasil. 
Sua missão é criar 3 opções de textos persuasivos (Legendas) e textos de tela (Text Overlays) para uma campanha focada em conversão extrema.

DADOS DA CAMPANHA:
- Produto: ${formData.productName}
- Oferta: ${formData.offer || 'Venda direta'}
- Call to Action: ${formData.cta}
- Ângulo da Abordagem: ${formData.approach}
- Emoção Alvo: ${formData.emotion}

DIRETRIZES:
1. Textos de Tela devem chamar atenção nos primeiros 3 segundos.
2. A legenda deve complementar o vídeo e empurrar para o clique.
3. Use Emojis estrategicamente.
4. NUNCA gere markdown como codigo. Formate em texto puro com quebras de linha claras.

RETORNE 3 VARIAÇÕES no formato:
VARIAÇÃO [Número]
[Texto de Tela 3 Segundos]: ...
[Legenda do Post]: ...
[Hashtags]: ...`

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
      setGeneratedCopy(text)
      addToast('Copys geradas com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      setGeneratedCopy('Ops, erro no servidor de IA. Tente novamente.')
      addToast('Erro ao gerar', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast('Copys copiadas!', 'success')
  }

  const nextStep = () => setStep(s => Math.min(6, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-background text-white selection:bg-primary/30">
      <AnimatedBackground />

      <AnimatePresence>
        {isGenerating && step !== 6 && (
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
                <TrendingUp className="w-10 h-10 text-accent animate-pulse" />
              </div>
              
              <h3 className="text-xl font-bold text-textPrimary mb-2">Hackeando o Algoritmo</h3>
              
              <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={processingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-accent font-medium"
                  >
                    {processingSteps[processingStep]?.replace('{emotion}', formData.emotion)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto space-y-6 pt-10 pb-20 relative z-10 min-h-screen">
        
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-indigo-400 mb-4">
            Copys Virais para Anúncios
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl font-medium">
            Engenharia de persuasão para explodir suas vendas nas redes sociais.
          </p>
        </div>

        <div className="mb-12 relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-border rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-indigo-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / 5) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          <div className="relative flex justify-between">
            {[1, 2, 3, 4, 5, 6].map(i => (
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
              <Card className="border-border bg-surface-elevated shadow-2xl rounded-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 1 de 6</h3>
                    <h2 className="text-3xl font-black text-white">O que estamos vendendo?</h2>
                    <p className="text-textSecondary">Descreva o seu produto ou serviço brevemente.</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Nome do Produto / Serviço"
                      value={formData.productName}
                      onChange={(e) => setFormData(p => ({ ...p, productName: e.target.value }))}
                      placeholder="Ex: Tênis Ortopédico Nuvem..."
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <Button onClick={nextStep} disabled={!formData.productName} className="w-full h-14 text-lg font-bold">
                      Avançar <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border bg-surface-elevated shadow-2xl rounded-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 2 de 6</h3>
                    <h2 className="text-3xl font-black text-white">A Oferta Irresistível</h2>
                    <p className="text-textSecondary">Tem desconto? Frete grátis? Compre 1 leve 2?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Detalhes da Oferta"
                      value={formData.offer}
                      onChange={(e) => setFormData(p => ({ ...p, offer: e.target.value }))}
                      placeholder="Ex: 50% de Desconto + Frete Grátis nas próximas 2h"
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
              <Card className="border-border bg-surface-elevated shadow-2xl rounded-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 3 de 6</h3>
                    <h2 className="text-3xl font-black text-white">Ângulo de Abordagem</h2>
                    <p className="text-textSecondary">Como vamos iniciar o texto do anúncio?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="approach" 
                      options={APPROACHES} 
                      value={formData.approach} 
                      onChange={(val) => setFormData(p => ({ ...p, approach: val }))} 
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

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border bg-surface-elevated shadow-2xl rounded-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 4 de 6</h3>
                    <h2 className="text-3xl font-black text-white">Gatilho Emocional</h2>
                    <p className="text-textSecondary">Qual sentimento principal deve mover o clique?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="emotion" 
                      options={EMOTIONS} 
                      value={formData.emotion} 
                      onChange={(val) => setFormData(p => ({ ...p, emotion: val }))} 
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

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border bg-surface-elevated shadow-2xl rounded-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 5 de 6</h3>
                    <h2 className="text-3xl font-black text-white">Call to Action (CTA)</h2>
                    <p className="text-textSecondary">O que vai estar escrito no botão do seu criativo?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="cta" 
                      options={CTAS} 
                      value={formData.cta} 
                      onChange={(val) => setFormData(p => ({ ...p, cta: val }))} 
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={generateAdCopy} className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryLight hover:to-indigo-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                      <TrendingUp className="w-5 h-5 mr-2" /> Hackear o Algoritmo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div key="step6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Suas Copys Vencedoras</h3>
                  <p className="text-textSecondary">Use esses ângulos para alavancar seu ROI.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="font-bold">
                    Refazer
                  </Button>
                  <Button onClick={copyToClipboard} className="bg-primary hover:bg-primaryLight font-bold">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado!' : 'Copiar Copys'}
                  </Button>
                </div>
              </div>
              
              <div className="rounded-xl border border-border/50 bg-surface-elevated/50 backdrop-blur-md shadow-2xl overflow-hidden p-2">
                {isGenerating ? (
                  <div className="h-[400px] flex flex-col items-center justify-center text-textSecondary gap-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-t-primary border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-primary border-l-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                      <TrendingUp className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-lg font-medium animate-pulse text-white">Escrevendo copys irresistíveis...</p>
                  </div>
                ) : (
                  <div className="h-[400px] w-full">
                    <GlassTerminal content={generatedCopy || ''} />
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
