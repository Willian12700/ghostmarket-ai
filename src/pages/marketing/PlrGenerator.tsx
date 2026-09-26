import { GlassTerminal } from '@/components/ui/GlassTerminal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { PillSelector } from '@/components/ui/PillSelector'
import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Copy, Check, Download, BookOpen, ChevronRight, Wand2, ChevronLeft } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { motion, AnimatePresence } from 'framer-motion'

export const PlrGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState('')
  const [copied, setCopied] = useState(false)
  const [step, setStep] = useState(1)
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
    theme: '',
    target: '',
    chapters: '5 Capítulos'
  })

  const CHAPTERS_OPTS = ['3 Capítulos', '5 Capítulos', '7 Capítulos', '10 Capítulos']

  const handleGenerate = async () => {
    if (!formData.theme || !formData.target) { 
      addToast('Preencha os campos', 'error')
      return 
    }

    setIsGenerating(true)
    setStep(4)
    addToast('Escrevendo E-book completo... Isso pode levar até 1 minuto.', 'success')

    const prompt = `Você é um autor Best-Seller e Copywriter focado em conversão.
Escreva o CONTEÚDO COMPLETO de um E-book sobre: "${formData.theme}".
O público-alvo é: "${formData.target}".
O livro deve ter ${formData.chapters}.

ESTRUTURA OBRIGATÓRIA:
1. TÍTULO OFICIAL: Dê um título extremamente persuasivo no estilo best-seller.
2. INTRODUÇÃO: Uma abertura emocional conectando com a dor do leitor e prometendo a solução.
3. DESENVOLVIMENTO: Escreva o conteúdo extenso e rico de CADA UM dos capítulos. Não resuma. Desenvolva o texto de forma didática, como um livro real que será vendido.
4. CONCLUSÃO: Um fechamento inspirador com um passo a passo final.

AVISO: Este é um produto real que será entregue aos clientes. ENTREGUE O TEXTO COMPLETO E DENSO DOS CAPÍTULOS, não apenas um esboço.
Formate tudo com Markdown.`

    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Você é um escritor profissional de E-books e PLRs extensos.' },
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
      addToast('E-book escrito com sucesso!', 'success')
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

  const exportToPDF = () => {
    if (!generatedResult) return;
    
    let htmlContent = generatedResult
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
      .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
      .replace(/^\\s*-\\s+(.*$)/gim, '<li>$1</li>')
      .replace(/\\n/g, '<br>');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>E-book Exportado</title>
            <style>
              body { font-family: 'Georgia', serif; color: #333; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 40px; }
              h1 { font-size: 32px; color: #111; text-align: center; margin-bottom: 50px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
              h2 { font-size: 24px; color: #222; margin-top: 40px; border-bottom: 1px solid #eee; padding-bottom: 10px; }
              h3 { font-size: 20px; color: #444; margin-top: 30px; }
              p, br { margin-bottom: 15px; }
              li { margin-bottom: 8px; }
              @media print {
                body { padding: 0; margin: 20mm; }
                h1 { page-break-before: always; margin-top: 50px; }
                h2 { page-break-after: avoid; }
              }
            </style>
          </head>
          <body>
            ${htmlContent}
            <script>
              window.onload = () => {
                window.print();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  }

  const nextStep = () => setStep(s => Math.min(4, s + 1))
  const prevStep = () => setStep(s => Math.max(1, s - 1))

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-background text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="max-w-4xl mx-auto space-y-6 pt-10 pb-20 relative z-10 min-h-screen">
        
        <div className="mb-12 flex flex-col items-center justify-center text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 border border-primary/20 shadow-glow-sm">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-primary to-indigo-400 mb-4">
            Máquina de PLR / E-book
          </h1>
          <p className="text-lg text-textSecondary max-w-2xl font-medium">
            Escreva infoprodutos inteiros em minutos e venda como seu.
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
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 1 de 4</h3>
                    <h2 className="text-3xl font-black text-white">O Tema do E-book</h2>
                    <p className="text-textSecondary">Sobre o que é o seu livro?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Tema Central"
                      value={formData.theme}
                      onChange={(e) => setFormData(p => ({ ...p, theme: e.target.value }))}
                      placeholder="Ex: Como emagrecer 10kg em 30 dias sem academia..."
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <Button onClick={nextStep} disabled={!formData.theme} className="w-full h-14 text-lg font-bold">
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
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 2 de 4</h3>
                    <h2 className="text-3xl font-black text-white">Para quem é?</h2>
                    <p className="text-textSecondary">Defina o público-alvo para a IA adaptar a linguagem.</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <Input 
                      label="Público-Alvo"
                      value={formData.target}
                      onChange={(e) => setFormData(p => ({ ...p, target: e.target.value }))}
                      placeholder="Ex: Mães ocupadas que não tem tempo para cozinhar"
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={nextStep} disabled={!formData.target} className="flex-1 h-14 text-lg font-bold">
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
                    <h3 className="text-sm font-bold tracking-widest text-textSecondary uppercase">Passo 3 de 4</h3>
                    <h2 className="text-3xl font-black text-white">Tamanho do E-book</h2>
                    <p className="text-textSecondary">Quantos capítulos a IA deve escrever?</p>
                  </div>
                  
                  <div className="space-y-4 pt-4">
                    <PillSelector 
                      id="chapters" 
                      options={CHAPTERS_OPTS} 
                      value={formData.chapters} 
                      onChange={(val) => setFormData(p => ({ ...p, chapters: val }))} 
                    />
                  </div>

                  <div className="pt-6 border-t border-border/50 flex gap-4">
                    <Button variant="secondary" onClick={prevStep} className="h-14 px-6"><ChevronLeft className="w-5 h-5" /></Button>
                    <Button onClick={handleGenerate} disabled={!formData.chapters} className="flex-1 h-14 text-lg font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primaryLight hover:to-indigo-500 shadow-glow">
                      <Wand2 className="w-5 h-5 mr-2" /> Escrever Meu E-book
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
                  <h3 className="text-xl font-bold text-white mb-2">E-book Finalizado</h3>
                  <p className="text-textSecondary">Pronto para diagramar e vender.</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStep(1)} className="font-bold">
                    Refazer
                  </Button>
                  <Button variant="secondary" onClick={copyToClipboard} className="font-bold">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado!' : 'Copiar Texto'}
                  </Button>
                  <Button onClick={exportToPDF} className="bg-primary hover:bg-primaryLight font-bold text-white">
                    <Download className="w-4 h-4 mr-2" /> Exportar PDF
                  </Button>
                </div>
              </div>
              
              <div className="rounded-xl border border-border/50 bg-surface-elevated/50 backdrop-blur-md shadow-2xl overflow-hidden p-2">
                {isGenerating ? (
                  <div className="h-[500px] flex flex-col items-center justify-center text-textSecondary gap-6">
                    <div className="relative w-20 h-20">
                      <div className="absolute inset-0 border-4 border-t-primary border-r-indigo-500 border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-2 border-4 border-t-transparent border-r-transparent border-b-primary border-l-indigo-500 rounded-full animate-[spin_1.5s_linear_infinite_reverse]"></div>
                      <BookOpen className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                    </div>
                    <p className="text-lg font-medium animate-pulse text-white">Escrevendo como um Best-Seller...</p>
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
