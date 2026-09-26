import { GlassTerminal } from '@/components/ui/GlassTerminal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PillSelector } from '@/components/ui/PillSelector'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Copy, Check, Activity, Brain, ChevronRight, ChevronLeft } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'

export const VslGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(1)
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
    productName: '',
    niche: 'Saúde / Fitness',
    pain: '',
    mechanism: ''
  })

  const NICHES = [
    'Saúde / Fitness',
    'Finanças / Renda Extra',
    'Marketing / Vendas',
    'Relacionamentos',
    'Idiomas',
    'Desenvolvimento Pessoal'
  ]

  const emotionData = [
    { stage: 'Gancho', emotion: 8, label: 'Curiosidade', desc: 'Prendendo a atenção nos 5s' },
    { stage: 'A Dor', emotion: 2, label: 'Frustração', desc: 'Identificação com o problema' },
    { stage: 'Mecanismo', emotion: 6, label: 'Esperança', desc: 'Epifania da solução' },
    { stage: 'A Oferta', emotion: 9, label: 'Desejo', desc: 'Apresentação do produto' },
    { stage: 'Ancoragem', emotion: 5, label: 'Tensão', desc: 'Justificativa do preço' },
    { stage: 'Garantia', emotion: 10, label: 'Confiança', desc: 'Quebra de objeção final' },
  ]

  const handleGenerate = async () => {
    if (!formData.productName || !formData.pain || !formData.mechanism) { 
      addToast('Preencha todos os campos', 'error')
      return 
    }

    setIsGenerating(true)
    setStep(5)
    addToast('A IA está analisando a psicologia do cliente...', 'success')

    const prompt = `Você é o Copywriter mais caro do Brasil, especialista em VSLs (Video Sales Letters) de múltiplos 8 dígitos.
Crie um roteiro de VSL completo para o produto "${formData.productName}" (Nicho: ${formData.niche}).
A dor principal do cliente é: "${formData.pain}".
O Mecanismo Único (o segredo da solução) é: "${formData.mechanism}".

ESTRUTURA DO ROTEIRO:
1. THE LEAD (O Gancho/Promessa): Chame atenção nos primeiros 10 segundos. Prometa a solução para a dor.
2. A HISTÓRIA (Jornada do Herói): Uma história emocional de fracasso antes de descobrir o mecanismo.
3. O MECANISMO ÚNICO: Explique cientificamente/logicamente como a solução funciona.
4. A OFERTA: Apresente o produto e os bônus.
5. ANCORAGEM DE PREÇO & CTA: Diga o preço original (caro) e o preço atual (irresistível), com chamada pra ação clara.
6. GARANTIA & ESCASSEZ.

Formate o texto em Markdown (use negritos, títulos).`

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Você é um especialista em Neuromarketing e Copywriting de resposta direta.' },
            { role: 'user', content: prompt }
          ],
          model: 'openai'
        })
      })

      if (!response.ok) throw new Error('API Error')
      const text = await response.text()
      if (!text) throw new Error('Vazio')
      setGeneratedResult(text)
      setCopied(false)
      addToast('Análise Emocional concluída! VSL Gerada.', 'success')
    } catch (error) {
      console.error(error)
      setGeneratedResult('Ops, erro no servidor de IA. Tente novamente.')
      addToast('Erro ao gerar', 'error')
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
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="max-w-6xl mx-auto space-y-6 pt-10 pb-20 relative z-10 min-h-screen">
        
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-6 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
            <Brain className="w-3 h-3 fill-primary" /> Neuromarketing Ativado
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-indigo-400 mb-4">
            Ghost VSL Maker
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl font-medium">
            Crie roteiros de Vídeos de Vendas com Análise de Curva Emocional integrada.
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
                    <h2 className="text-3xl font-black text-white">Nome do Produto</h2>
                    <p className="text-textSecondary">Como se chama o que você está vendendo?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Nome do Produto"
                      value={formData.productName}
                      onChange={(e) => setFormData(p => ({ ...p, productName: e.target.value }))}
                      placeholder="Ex: Método Queima 30D"
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
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 2 de 5</h3>
                    <h2 className="text-3xl font-black text-white">Nicho do Produto</h2>
                    <p className="text-textSecondary">Qual é o mercado em que você atua?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="niche" 
                      options={NICHES} 
                      value={formData.niche} 
                      onChange={(val) => setFormData(p => ({ ...p, niche: val }))} 
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
                    <h2 className="text-3xl font-black text-white">Qual a Dor Principal?</h2>
                    <p className="text-textSecondary">O que mais machuca seu cliente hoje?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="A maior frustração"
                      value={formData.pain}
                      onChange={(e) => setFormData(p => ({ ...p, pain: e.target.value }))}
                      placeholder="Ex: Tenta fazer dieta mas desiste porque passa fome"
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={nextStep} disabled={!formData.pain} className="flex-1 h-14 text-lg font-bold">
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
                    <h2 className="text-3xl font-black text-white">O Mecanismo Único</h2>
                    <p className="text-textSecondary">Qual é o grande segredo da sua solução?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Mecanismo (O 'Veículo' novo)"
                      value={formData.mechanism}
                      onChange={(e) => setFormData(p => ({ ...p, mechanism: e.target.value }))}
                      placeholder="Ex: Ativação Metabólica Noturna em 3 fases"
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={handleGenerate} disabled={!formData.mechanism} className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryLight hover:to-indigo-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                      <Brain className="w-5 h-5 mr-2" /> Engatilhar VSL
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div key="step5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">Engenharia Emocional</h3>
                      <p className="text-textSecondary text-sm">Curva de engajamento do roteiro gerado.</p>
                    </div>
                  </div>

                  <Card className="border-border/50 bg-panel/50 backdrop-blur-md shadow-2xl">
                    <CardContent className="p-6">
                      <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={emotionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs>
                              <linearGradient id="colorEmotion" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.5}/>
                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                            <XAxis dataKey="stage" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v*10}%`} />
                            <RechartsTooltip 
                              contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
                              itemStyle={{ color: '#c084fc' }}
                              labelStyle={{ color: '#fff', fontWeight: 'bold', marginBottom: '4px' }}
                            />
                            <Area type="monotone" dataKey="emotion" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorEmotion)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {emotionData.map((d, i) => (
                          <div key={i} className="flex flex-col gap-1">
                            <span className="text-xs text-textSecondary uppercase tracking-wider">{d.stage}</span>
                            <span className="text-sm font-semibold text-primaryLight">{d.label}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex gap-3 mt-4">
                    <Button variant="secondary" onClick={() => setStep(1)} className="font-bold flex-1">
                      Refazer VSL
                    </Button>
                    <Button onClick={copyToClipboard} className="bg-primary hover:bg-primaryLight font-bold flex-1">
                      {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copiado!' : 'Copiar Roteiro'}
                    </Button>
                  </div>
                </div>

                <div className="rounded-xl border border-border/50 bg-panel/50 backdrop-blur-md shadow-2xl overflow-hidden p-2 flex flex-col h-[550px]">
                  {isGenerating ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-textSecondary gap-6">
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 border-4 border-t-primary border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                        <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-primary border-l-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                        <Activity className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                      </div>
                      <p className="text-lg font-medium animate-pulse text-white">Analisando neuromarketing...</p>
                    </div>
                  ) : (
                    <div className="flex-1 w-full overflow-hidden">
                      <GlassTerminal content={generatedResult || ''} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
