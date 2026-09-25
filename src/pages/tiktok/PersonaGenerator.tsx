import { GlassTerminal } from '@/components/ui/GlassTerminal'
import { AnimatedBackground } from '@/components/ui/AnimatedBackground'
import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Copy, Check, Users, Target } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

export const PersonaGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPersona, setGeneratedPersona] = useState('')
  const [copied, setCopied] = useState(false)
  const { addToast } = useToastStore()
  

  const [formData, setFormData] = useState({
    niche: '',
    product: '',
    painPoint: ''
  })

  const generatePersona = async () => {
    if (!formData.niche || !formData.product) {
      addToast('Preencha o Nicho e o Produto', 'error')
      return
    }

    setIsGenerating(true)
    addToast('A IA está mapeando a mente do seu cliente ideal...', 'success')

    const prompt = `
Atue como um Especialista em Marketing e Psicologia do Consumidor de altíssimo nível.
Crie a Persona perfeita (Cliente Ideal) para o seguinte cenário:
- Nicho: ${formData.niche}
- Produto: ${formData.product}
- Dor Principal (Opcional): ${formData.painPoint || 'Não informada'}

Sua análise deve ser profunda e psicológica. Não quero apenas dados demográficos. 
Preciso de:
1. Nome, Idade, Profissão, Renda.
2. Dores Ocultas (O que tira o sono dele à noite?).
3. Desejos Inconfessáveis (O que ele realmente quer, mas tem vergonha de dizer?).
4. Objeções Principais (Por que ele não compraria o ${formData.product} hoje?).
5. Ângulos de Venda (3 ideias de como vender pra ele sem parecer vendedor).

Retorne o texto formatado limpo, sem usar codigo ou markdown complexo.
`

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

  return (
    <div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30">
      <AnimatedBackground />
      <div className="space-y-6 max-w-5xl mx-auto pb-10 relative z-10 min-h-screen pb-20">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" /> Mapeamento de Persona AI
        </h2>
        <p className="text-textSecondary">Descubra os desejos ocultos e as maiores dores do seu cliente ideal em segundos usando a inteligência do Gemini.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados do Negócio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Qual o seu Nicho?"
                placeholder="Ex: Emagrecimento, Finanças, Beleza..."
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              />

              <Input
                label="Qual Produto você vende?"
                placeholder="Ex: Cápsula Seca Barriga"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              />
              
              <Input
                label="Qual a dor principal do cliente? (Opcional)"
                placeholder="Ex: Já tentou de tudo e não emagrece"
                value={formData.painPoint}
                onChange={(e) => setFormData({ ...formData, painPoint: e.target.value })}
              />
            </CardContent>
          </Card>

          <Button 
            className="w-full shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]" 
            size="lg" 
            onClick={generatePersona}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Target className="w-5 h-5 mr-2" /> Descobrir Meu Cliente Ideal</>
            )}
          </Button>
        </div>

        <div className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Dossiê da Persona</CardTitle>
              {generatedPersona && (
                <Button variant="secondary" size="sm" onClick={copyToClipboard} className="h-7 text-xs">
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copiar
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {generatedPersona ? (
                <div className="bg-panelHover rounded-lg border border-border p-5 h-full min-h-[500px] overflow-auto custom-scrollbar">
                  <div className="mt-8 h-[500px] w-full"><GlassTerminal content={generatedPersona || ''} /></div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-textSecondary text-sm border border-dashed border-border rounded-lg bg-background/50 text-center p-8 gap-4">
                  <Target className="w-12 h-12 text-primary/20" />
                  <p>Preencha os campos ao lado para a IA criar um perfil psicológico detalhado do seu cliente.</p>
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
