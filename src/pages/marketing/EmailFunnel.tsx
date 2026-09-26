import { GlassTerminal } from '@/components/ui/GlassTerminal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PillSelector } from '@/components/ui/PillSelector'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Copy, Check, Mail, ChevronRight, ChevronLeft } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'

export const EmailFunnel = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(1)
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
    product: '',
    funnelType: 'Boas-Vindas',
    emails: '3 E-mails'
  })

  const FUNNEL_TYPES = [
    'Boas-Vindas',
    'Carrinho Abandonado',
    'Lançamento (Oferta)',
    'Aquecimento de Leads',
    'Recuperação de Boleto/PIX'
  ]

  const EMAIL_COUNTS = ['3 E-mails', '5 E-mails', '7 E-mails']

  const handleGenerate = async () => {
    if (!formData.product) { 
      addToast('Preencha o nome do produto', 'error')
      return 
    }

    setIsGenerating(true)
    setStep(4)
    addToast('A IA está estruturando o seu funil...', 'success')

    const prompt = `Você é um Copywriter especialista em E-mail Marketing e automação (nível gringo).
Crie um Funil de E-mails do tipo "${formData.funnelType}" para vender o produto: "${formData.product}".
A sequência deve conter ${formData.emails}.

PARA CADA E-MAIL, FORNEÇA:
- [Assunto] (Pelo menos 2 opções de assuntos persuasivos, com taxa de abertura alta)
- [Corpo do E-mail] (O texto escrito de forma pessoal, como se estivesse conversando com um amigo, gerando conexão e curiosidade)
- [Call to Action / Link] (Instrução clara do que ele deve clicar)
- [Gatilho Mental Utilizado] (Explique qual gatilho você usou neste e-mail)

Faça uma progressão lógica. O primeiro e-mail introduz/lembra, o segundo gera desejo/quebra objeção, e o último aplica escassez/urgência máxima. Formate com Markdown.`

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Você é um especialista em Marketing Digital focado em conversão e copywriting.' },
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
      addToast('Funil gerado com sucesso!', 'success')
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

  const nextStep = () => setStep(s => Math.min(4, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto space-y-6 pt-10 pb-20 relative z-10 min-h-screen">
        
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-indigo-400 mb-4">
            Funil de E-mail Marketing
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl font-medium">
            Gere sequências automáticas que vendem no piloto automático todos os dias.
          </p>
        </div>

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

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-2xl mx-auto">
              <Card className="border-border/50 bg-panel/50 backdrop-blur-sm shadow-2xl">
                <CardContent className="p-8 space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 1 de 4</h3>
                    <h2 className="text-3xl font-black text-white">Objetivo da Automação</h2>
                    <p className="text-textSecondary">Qual é o tipo de jornada que o lead vai receber?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="funnelType" 
                      options={FUNNEL_TYPES} 
                      value={formData.funnelType} 
                      onChange={(val) => setFormData(p => ({ ...p, funnelType: val }))} 
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <Button onClick={nextStep} disabled={!formData.funnelType} className="w-full h-14 text-lg font-bold">
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
                    <h2 className="text-3xl font-black text-white">Tamanho da Sequência</h2>
                    <p className="text-textSecondary">Quantos e-mails farão parte dessa estratégia?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="emails" 
                      options={EMAIL_COUNTS} 
                      value={formData.emails} 
                      onChange={(val) => setFormData(p => ({ ...p, emails: val }))} 
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={nextStep} disabled={!formData.emails} className="flex-1 h-14 text-lg font-bold">
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
                    <h2 className="text-3xl font-black text-white">O que estamos vendendo?</h2>
                    <p className="text-textSecondary">No final da automação, para onde você envia o lead?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Nome do Produto / Oferta"
                      value={formData.product}
                      onChange={(e) => setFormData(p => ({ ...p, product: e.target.value }))}
                      placeholder="Ex: Mentoria Acelerador de Vendas..."
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={handleGenerate} disabled={!formData.product} className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryLight hover:to-indigo-500 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                      <Mail className="w-5 h-5 mr-2" /> Gerar Sequência Pronta
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
                  <h3 className="text-xl font-bold text-white mb-2">Máquina de Vendas Ativada</h3>
                  <p className="text-textSecondary">Seus e-mails configurados com gatilhos mentais fortes.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="font-bold">
                    Refazer
                  </Button>
                  <Button onClick={copyToClipboard} className="bg-primary hover:bg-primaryLight font-bold">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado!' : 'Copiar Sequência'}
                  </Button>
                </div>
              </div>
              
              <div className="rounded-xl border border-border/50 bg-panel/50 backdrop-blur-md shadow-2xl overflow-hidden p-2">
                {isGenerating ? (
                  <div className="h-[400px] flex flex-col items-center justify-center text-textSecondary gap-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-t-primary border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-primary border-l-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                      <Mail className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-lg font-medium animate-pulse text-white">Criando linha do tempo persuasiva...</p>
                  </div>
                ) : (
                  <div className="h-[400px] w-full">
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
