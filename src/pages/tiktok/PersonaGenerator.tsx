import { GlassTerminal } from '@/components/ui/GlassTerminal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PillSelector } from '@/components/ui/PillSelector'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Copy, Check, Target, ChevronRight, ChevronLeft } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'

export const PersonaGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPersona, setGeneratedPersona] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(1)
  const { addToast } = useToastStore()

  const [formData, setFormData] = useState({
    niche: '',
    customNiche: '',
    product: '',
    painPoint: ''
  })

  const NICHES = ['Saúde / Emagrecimento', 'Finanças / Investimentos', 'Beleza / Estética', 'Educação / Cursos', 'E-commerce', 'Tecnologia / SaaS', 'Outro']

  const generatePersona = async () => {
    const finalNiche = formData.niche === 'Outro' ? formData.customNiche : formData.niche;
    if (!finalNiche || !formData.product) {
      addToast('Preencha o Nicho e o Produto', 'error')
      return
    }

    setIsGenerating(true)
    setStep(4)
    addToast('A IA está mapeando a mente do seu cliente ideal...', 'success')

    const prompt = `Atue como um Especialista em Marketing e Psicologia do Consumidor de altíssimo nível.
Crie a Persona perfeita (Cliente Ideal) para o seguinte cenário:
- Nicho: ${finalNiche}
- Produto: ${formData.product}
- Dor Principal (Opcional): ${formData.painPoint || 'Não informada'}

Sua análise deve ser profunda e psicológica. Não quero apenas dados demográficos. 
Preciso de:
1. Nome, Idade, Profissão, Renda.
2. Dores Ocultas (O que tira o sono dele à noite?).
3. Desejos Inconfessáveis (O que ele realmente quer, mas tem vergonha de dizer?).
4. Objeções Principais (Por que ele não compraria hoje?).
5. Ângulos de Venda (3 ideias de como vender pra ele sem parecer vendedor).

Retorne o texto formatado em Markdown.`

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
      setGeneratedPersona(text)
      addToast('Persona mapeada com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      setGeneratedPersona('Ops, o servidor de IA está sobrecarregado no momento. Tente novamente.')
      addToast('Erro ao gerar', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPersona)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast('Persona copiada!', 'success')
  }

  const nextStep = () => setStep(s => Math.min(4, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto space-y-6 pt-10 pb-20 relative z-10 min-h-screen">
        
        {/* Header */}
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <Target className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-indigo-400 mb-4">
            Criador de Persona
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl font-medium">
            Descubra os desejos ocultos e as maiores dores do seu cliente ideal.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 relative max-w-2xl mx-auto">
          <div className="absolute top-1/2 left-0 w-full h-1 -translate-y-1/2 bg-border rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-indigo-500"
              initial={{ width: '0%' }}
              animate={{ width: `${((step - 1) / 3) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
          <div className="relative flex justify-between">
            {[1, 2, 3, 4].map(i => (
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

        {/* Steps Content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 1 de 4</h3>
                    <h2 className="text-3xl font-black text-white">Qual o Nicho do seu negócio?</h2>
                    <p className="text-textSecondary">Onde seu cliente ideal gasta dinheiro hoje?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="niche" 
                      options={NICHES} 
                      value={formData.niche} 
                      onChange={(val) => setFormData(p => ({ ...p, niche: val }))} 
                    />
                    
                    <AnimatePresence>
                      {formData.niche === 'Outro' && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                          <Input 
                            label="Especifique seu nicho"
                            value={formData.customNiche}
                            onChange={(e) => setFormData(p => ({ ...p, customNiche: e.target.value }))}
                            placeholder="Ex: Mercado Pet, Imóveis de Luxo..."
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <Button onClick={nextStep} disabled={!formData.niche || (formData.niche === 'Outro' && !formData.customNiche)} className="w-full h-14 text-lg font-bold">
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
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 2 de 4</h3>
                    <h2 className="text-3xl font-black text-white">O que você está vendendo?</h2>
                    <p className="text-textSecondary">Seja específico. A IA precisa entender sua oferta.</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Produto ou Serviço"
                      value={formData.product}
                      onChange={(e) => setFormData(p => ({ ...p, product: e.target.value }))}
                      placeholder="Ex: Mentoria de Vendas High Ticket, Cápsula de Colágeno..."
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
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 3 de 4</h3>
                    <h2 className="text-3xl font-black text-white">Qual a Dor Principal?</h2>
                    <p className="text-textSecondary">O que tira o sono do seu cliente? (Opcional, mas recomendado)</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Descreva a Dor ou Frustração"
                      value={formData.painPoint}
                      onChange={(e) => setFormData(p => ({ ...p, painPoint: e.target.value }))}
                      placeholder="Ex: Tenta faturar 10k/mês mas nunca consegue passar de 2k"
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={generatePersona} className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryLight hover:to-indigo-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                      <Target className="w-5 h-5 mr-2" /> Gerar Persona Master
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Dossiê do Cliente Ideal</h3>
                  <p className="text-textSecondary">Análise comportamental concluída.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="font-bold">
                    Refazer
                  </Button>
                  <Button onClick={copyToClipboard} className="bg-primary hover:bg-primaryLight font-bold">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado!' : 'Copiar Dossiê'}
                  </Button>
                </div>
              </div>
              
              <div className="rounded-xl border border-border/50 bg-panel/50 backdrop-blur-md shadow-2xl overflow-hidden p-2">
                {isGenerating ? (
                  <div className="h-[500px] flex flex-col items-center justify-center text-textSecondary gap-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-t-primary border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-primary border-l-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                      <Target className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-lg font-medium animate-pulse text-white">Mapeando comportamentos...</p>
                  </div>
                ) : (
                  <div className="h-[500px] w-full">
                    <GlassTerminal content={generatedPersona || ''} />
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
