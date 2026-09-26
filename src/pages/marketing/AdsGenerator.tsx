import { GlassTerminal } from '@/components/ui/GlassTerminal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PillSelector } from '@/components/ui/PillSelector'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Copy, Check, Megaphone, ChevronRight, ChevronLeft } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'

export const AdsGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(1)
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
    objective: 'Vendas Diretas',
    product: '',
    offer: '',
    objection: ''
  })

  const OBJECTIVES = ['Vendas Diretas', 'Captura de Leads', 'Engajamento', 'Mensagens no WhatsApp', 'Distribuição de Conteúdo']

  const handleGenerate = async () => {
    if (!formData.product || !formData.offer || !formData.objection) { 
      addToast('Preencha os dados do produto', 'error'); 
      return; 
    }

    setIsGenerating(true)
    setStep(5)
    addToast('A IA está gerando suas Copies e Criativos...', 'success')

    const prompt = `Você é o maior Gestor de Tráfego e Copywriter de Anúncios do Brasil.
Objetivo da Campanha: ${formData.objective}
Produto: "${formData.product}"
Oferta atual: "${formData.offer}"
Maior objeção do público: "${formData.objection}"

ME ENTREGUE EXATAMENTE:
1. COPY 1 (DIRETA): Focada em conversão rápida.
2. COPY 2 (STORYTELLING): Quebrando a objeção principal com uma história.
3. COPY 3 (CURIOSIDADE): Texto curto, focado em gerar clique barato (CTR alto).
4. IDEIA DE CRIATIVO 1 (IMAGEM): O que deve estar escrito e como deve ser o design?
5. IDEIA DE CRIATIVO 2 (VÍDEO): Roteiro curto e direto ao ponto.
6. SEGMENTAÇÃO: Sugira 3 interesses para o Gerenciador de Anúncios.

Formate em Markdown.`

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
      
      setGeneratedResult(text)
      setCopied(false)
      addToast('Anúncios gerados com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      addToast('Erro ao gerar conteúdo. Tente novamente.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedResult)
    setCopied(true)
    addToast('Copiado para a área de transferência!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  const nextStep = () => setStep(s => Math.min(5, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-background text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto space-y-6 pt-10 pb-20 relative z-10 min-h-screen">
        
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20 shadow-glow-sm">
            <Megaphone className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-indigo-400 mb-4">
            Gerador de Anúncios
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl font-medium">
            Crie copies validadas e ideias de criativos altamente persuasivos.
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
              <Card className="border-border bg-surface-elevated shadow-2xl rounded-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 1 de 5</h3>
                    <h2 className="text-3xl font-black text-white">Objetivo da Campanha</h2>
                    <p className="text-textSecondary">O que você quer que o cliente faça ao ver o anúncio?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="objective" 
                      options={OBJECTIVES} 
                      value={formData.objective} 
                      onChange={(val) => setFormData(p => ({ ...p, objective: val }))} 
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <Button onClick={nextStep} disabled={!formData.objective} className="w-full h-14 text-lg font-bold">
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
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 2 de 5</h3>
                    <h2 className="text-3xl font-black text-white">O que vamos anunciar?</h2>
                    <p className="text-textSecondary">Descreva o seu produto de forma simples e direta.</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Nome e descrição rápida"
                      value={formData.product}
                      onChange={(e) => setFormData(p => ({ ...p, product: e.target.value }))}
                      placeholder="Ex: Treinamento de Vendas B2B pelo WhatsApp..."
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

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border bg-surface-elevated shadow-2xl rounded-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 3 de 5</h3>
                    <h2 className="text-3xl font-black text-white">Qual a Oferta?</h2>
                    <p className="text-textSecondary">O que torna isso irresistível hoje?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Preço, Bônus ou Diferencial"
                      value={formData.offer}
                      onChange={(e) => setFormData(p => ({ ...p, offer: e.target.value }))}
                      placeholder="Ex: De R$997 por R$297 + 3 Bônus Exclusivos apenas hoje"
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={nextStep} disabled={!formData.offer} className="flex-1 h-14 text-lg font-bold">
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
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 4 de 5</h3>
                    <h2 className="text-3xl font-black text-white">Quebrando Objeções</h2>
                    <p className="text-textSecondary">Por que a pessoa NÃO compraria de você?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="A maior objeção do cliente"
                      value={formData.objection}
                      onChange={(e) => setFormData(p => ({ ...p, objection: e.target.value }))}
                      placeholder="Ex: Acho que é mais um cursinho enrolado / Não tenho tempo"
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={handleGenerate} disabled={!formData.objection} className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryLight hover:to-indigo-500 shadow-glow">
                      <Megaphone className="w-5 h-5 mr-2" /> Gerar Máquina de Vendas
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
                  <h3 className="text-xl font-bold text-white mb-2">Seus Anúncios Prontos</h3>
                  <p className="text-textSecondary">Copies e criativos desenhados para alta conversão.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="font-bold">
                    Refazer
                  </Button>
                  <Button onClick={copyToClipboard} className="bg-primary hover:bg-primaryLight font-bold">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado!' : 'Copiar Anúncios'}
                  </Button>
                </div>
              </div>
              
              <div className="rounded-xl border border-border/50 bg-surface-elevated/50 backdrop-blur-md shadow-2xl overflow-hidden p-2">
                {isGenerating ? (
                  <div className="h-[500px] flex flex-col items-center justify-center text-textSecondary gap-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-t-primary border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-primary border-l-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                      <Megaphone className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-lg font-medium animate-pulse text-white">Criando copies irresistíveis...</p>
                  </div>
                ) : (
                  <div className="h-[500px] w-full">
                    <GlassTerminal content={generatedResult || ''} />
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
