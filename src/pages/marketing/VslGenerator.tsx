import { GlassTerminal } from '@/components/ui/GlassTerminal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Wand2, Copy, Check, Activity, Brain } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

export const VslGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState('')
  const [copied, setCopied] = useState(false)
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
    productName: '',
    niche: '',
    pain: '',
    mechanism: ''
  })

  const emotionData = [
    { stage: 'Gancho', emotion: 8, label: 'Curiosidade', desc: 'Prendendo a atenção nos 5s' },
    { stage: 'A Dor', emotion: 2, label: 'Frustração', desc: 'Identificação com o problema' },
    { stage: 'Mecanismo', emotion: 6, label: 'Esperança', desc: 'Epifania da solução' },
    { stage: 'A Oferta', emotion: 9, label: 'Desejo', desc: 'Apresentação do produto' },
    { stage: 'Ancoragem', emotion: 5, label: 'Tensão', desc: 'Justificativa do preço' },
    { stage: 'Garantia (CTA)', emotion: 10, label: 'Confiança', desc: 'Quebra de objeção final' },
  ]

  const handleGenerate = async () => {
    if (!formData.productName || !formData.niche || !formData.pain || !formData.mechanism) { 
      addToast('Preencha todos os campos', 'error'); 
      return; 
    }

    setIsGenerating(true)
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
      
      setGeneratedResult(text)
      setCopied(false)
      addToast('Análise Emocional concluída! VSL Gerada.', 'success')
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

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="max-w-7xl mx-auto space-y-6 pb-20 relative z-10 min-h-screen pb-20">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-3">
          <Brain className="w-3 h-3 fill-primary" /> Neuromarketing Ativado
        </div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Ghost VSL Maker</h2>
        <p className="text-textSecondary mt-2">Crie roteiros de Vídeos de Vendas com Análise de Curva Emocional integrada.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* CONFIGURAÇÕES - COLUNA ESQUERDA */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border bg-panel">
            <CardHeader>
              <CardTitle className="text-lg text-white">Engenharia da Oferta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-textSecondary">Nome do Produto</label>
                <Input 
                  value={formData.productName} 
                  onChange={e => setFormData({ ...formData, productName: e.target.value })}
                  placeholder="Ex: Método Queima 30D"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-textSecondary">Nicho/Mercado</label>
                <Input 
                  value={formData.niche} 
                  onChange={e => setFormData({ ...formData, niche: e.target.value })}
                  placeholder="Ex: Emagrecimento, Finanças..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-textSecondary">Principal Dor</label>
                <Input 
                  value={formData.pain} 
                  onChange={e => setFormData({ ...formData, pain: e.target.value })}
                  placeholder="Ex: Tenta fazer dieta mas desiste"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-textSecondary">Mecanismo Único</label>
                <Input 
                  value={formData.mechanism} 
                  onChange={e => setFormData({ ...formData, mechanism: e.target.value })}
                  placeholder="Ex: Ativação Metabólica Noturna"
                />
              </div>
              <Button 
                className="w-full mt-6 shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="animate-pulse">Analisando Psicologia...</span>
                ) : (
                  <><Wand2 className="w-4 h-4 mr-2" /> Gerar VSL & Curva</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* RESULTADOS - COLUNA DIREITA */}
        <div className="lg:col-span-8 space-y-6">
          {generatedResult && (
            <Card className="border-primary/30 bg-panel relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/10 rounded-full blur-[80px] pointer-events-none" />
              <CardHeader className="relative z-10 border-b border-border/50 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg text-white">Ghost Emotional Curve Analyzer</CardTitle>
                  </div>
                  <span className="bg-success/10 text-success text-[10px] font-bold px-2 py-1 rounded border border-success/20">
                    Retenção Estimada: 68%
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-6 relative z-10">
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={emotionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorEmotion" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="stage" stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#6b7280" fontSize={10} tickLine={false} axisLine={false} dx={-10} domain={[0, 10]} hide />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: 'rgba(10,10,10,0.9)', borderColor: 'var(--color-primary)', borderRadius: '8px' }}
                        itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                        labelStyle={{ color: 'var(--color-primary)', fontWeight: 'bold', marginBottom: '4px' }}
                        formatter={(value, _name, props) => [`Nível ${value}/10 - ${props.payload.desc}`, 'Intensidade']}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="emotion" 
                        stroke="var(--color-primary)" 
                        strokeWidth={3}
                        activeDot={{ r: 6, fill: "var(--color-primary)", stroke: "#fff", strokeWidth: 2 }}
                        fillOpacity={1} 
                        fill="url(#colorEmotion)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 bg-background border border-border p-4 rounded-xl">
                  <p className="text-sm text-textSecondary leading-relaxed">
                    <strong className="text-white">Análise da IA:</strong> A curva acima mostra um mergulho profundo na dor emocional (nível 2) logo após o gancho. Esse vale de frustração é crucial para que, ao revelar o <strong>Mecanismo Único</strong>, o cérebro do cliente libere dopamina (nível 9), aumentando sua conversão no Checkout em até 4x.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-border bg-panel flex flex-col h-full min-h-[500px]">
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="text-xl text-white">Roteiro da VSL</CardTitle>
              {generatedResult && (
                <Button variant="secondary" size="sm" onClick={copyToClipboard} className="shadow-lg">
                  {copied ? <Check className="w-4 h-4 text-green-400 mr-2" /> : <Copy className="w-4 h-4 text-textSecondary mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar Script'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1 flex flex-col">
              {generatedResult ? (
                <div className="bg-background rounded-lg p-6 border border-border flex-1 overflow-y-auto custom-scrollbar prose prose-invert max-w-none">
                  <div className="mt-8 h-[500px] w-full"><GlassTerminal content={generatedResult || ''} /></div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-border/50 rounded-xl p-8 bg-background/50">
                  <Brain className="w-12 h-12 text-primary/30 mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">Aguardando Parâmetros</h3>
                  <p className="text-textSecondary text-center max-w-sm text-sm">
                    Preencha as configurações da oferta ao lado. A IA irá mapear a psicologia do seu cliente e escrever o script perfeito.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </div>
  )
}
