import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Wand2, Copy, Check, PlayCircle, FileText } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

export const ViralScripts = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [copied, setCopied] = useState(false)
  const { addToast } = useToastStore()
  

  const [formData, setFormData] = useState({
    productName: '',
    targetAudience: '',
    hookType: 'Curiosidade',
    videoLength: '15 a 30 segundos'
  })

  const generateScript = async () => {
    if (!formData.productName) {
      addToast('Digite o nome do produto', 'error')
      return
    }

    setIsGenerating(true)
    addToast('A IA está roteirizando seu vídeo viral...', 'success')

    const prompt = `
Você é o maior especialista em TikTok Orgânico e TikTok Ads.
Crie um roteiro de vídeo viral para o produto "${formData.productName}".
Público Alvo: ${formData.targetAudience || 'Geral'}
Duração: ${formData.videoLength}
Tipo de Gancho (Primeiros 3s): ${formData.hookType}

ESTRUTURA OBRIGATÓRIA DO ROTEIRO:
1. HOOK (0-3s): [Fala + Ação visual impactante]
2. RETENÇÃO (3-15s): [Desenvolvimento do problema + Solução com o produto]
3. CTA (Fim): [Chamada para ação clara pro link da bio ou botão]

Formate de forma limpa. Não use markdown como codigo.
Faça o texto dinâmico, rápido, estilo "UGC" (User Generated Content).
Escreva a [CENA VISUAL] e o [ÁUDIO/FALA].
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
      setGeneratedScript(text)
      addToast('Roteiro gerado com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      setGeneratedScript('Ops, o servidor de IA está sobrecarregado no momento. Tente novamente.')
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

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <PlayCircle className="w-6 h-6 text-primary" /> Roteiros Virais (UGC)
        </h2>
        <p className="text-textSecondary">Gere roteiros completos (cena por cena) para TikTok e Reels em segundos. Foco em retenção máxima e conversão em vendas.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Vídeo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Qual o nome do produto?"
                placeholder="Ex: Escova Secadora Magic"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              />

              <Input
                label="Quem é o Público Alvo?"
                placeholder="Ex: Mulheres de 20 a 40 anos sem tempo"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Formato do Roteiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Tipo de Gancho (Primeiros 3s)</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                  value={formData.hookType}
                  onChange={(e) => setFormData({ ...formData, hookType: e.target.value })}
                >
                  <option>Curiosidade (Você sabia que...)</option>
                  <option>Dor Aguda (Cansado de sofrer com...)</option>
                  <option>ASMR / Visual Satisfatório</option>
                  <option>Polêmica / Opinião impopular</option>
                  <option>Teste de Produto / React</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Duração do Vídeo</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                  value={formData.videoLength}
                  onChange={(e) => setFormData({ ...formData, videoLength: e.target.value })}
                >
                  <option>Curto e Direto (15 a 30 segundos)</option>
                  <option>Médio (30 a 60 segundos)</option>
                  <option>Longo/Storytelling (1 a 2 minutos)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]" 
            size="lg" 
            onClick={generateScript}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Wand2 className="w-5 h-5 mr-2" /> Dirigir Roteiro VIP</>
            )}
          </Button>
        </div>

        <div className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Roteiro Gerado</CardTitle>
              {generatedScript && (
                <Button variant="secondary" size="sm" onClick={copyToClipboard} className="h-7 text-xs">
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copiar
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {generatedScript ? (
                <div className="bg-panelHover rounded-lg border border-border p-5 h-full min-h-[500px] overflow-auto custom-scrollbar">
                  <div className="text-sm text-white whitespace-pre-wrap leading-relaxed font-sans">
                    {generatedScript}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-textSecondary text-sm border border-dashed border-border rounded-lg bg-background/50 text-center p-8 gap-4">
                  <FileText className="w-12 h-12 text-primary/20" />
                  <p>Preencha os detalhes do produto e gere um roteiro completo cena a cena pronto para gravar.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
