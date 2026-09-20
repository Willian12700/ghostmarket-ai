import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Wand2, Copy, Check, TrendingUp, PenTool } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

export const AdCopy = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCopy, setGeneratedCopy] = useState('')
  const [copied, setCopied] = useState(false)
  const { addToast } = useToastStore()
  

  const [formData, setFormData] = useState({
    productName: '',
    offer: '',
    approach: 'Urgência / Escassez (Últimas unidades)',
    emotion: 'FOMO (Medo de ficar de fora da trend)',
    cta: 'Compre Agora'
  })

  const generateAdCopy = async () => {
    if (!formData.productName) {
      addToast('Digite o nome do produto', 'error')
      return
    }

    setIsGenerating(true)
    addToast('A IA está analisando o ângulo e escrevendo as copys...', 'success')

    const prompt = `
Atue como o melhor Copywriter de TikTok Ads do Brasil. 
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
3. Use Emojis.
4. NUNCA gere markdown como codigo. Formate em texto puro com quebras de linha claras.

RETORNE 3 VARIAÇÕES no seguinte formato para cada uma:

VARIAÇÃO [Número]
[Texto de Tela 3 Segundos]: ...
[Legenda do Post]: ...
[Hashtags]: ...
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
      setGeneratedCopy(text)
      addToast('Copy gerada com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      setGeneratedCopy('Ops, o servidor de IA está sobrecarregado no momento. Tente novamente.')
      addToast('Erro ao gerar', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast('Copy copiada para a área de transferência!', 'success')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" /> Ghost Writer AI (TikTok Ads)
        </h2>
        <p className="text-textSecondary">Pare de perder tempo pensando no que escrever. Nossa IA gera scripts magnéticos e legendas de altíssima conversão em 5 segundos.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>O Produto e a Oferta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Qual o nome do produto?"
                placeholder="Ex: Smartwatch Ultra Pro"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              />

              <Input
                label="Qual é a sua Oferta Irresistível?"
                placeholder="Ex: Leve 2 Pague 1 com Frete Grátis hoje"
                value={formData.offer}
                onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ângulo Psicológico</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Abordagem Principal</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                  value={formData.approach}
                  onChange={(e) => setFormData({ ...formData, approach: e.target.value })}
                >
                  <option>Urgência / Escassez (Últimas unidades)</option>
                  <option>Benefício Principal Direto (Como isso muda sua vida)</option>
                  <option>História / Case de Sucesso (Review de cliente)</option>
                  <option>Polêmica / Segredo (O que as lojas não te contam)</option>
                  <option>Demonstração / Como Funciona</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Emoção Focada</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                  value={formData.emotion}
                  onChange={(e) => setFormData({ ...formData, emotion: e.target.value })}
                >
                  <option>FOMO (Medo de ficar de fora da trend)</option>
                  <option>Desejo de Status / Ficar atraente</option>
                  <option>Conforto / Segurança de uma boa compra</option>
                  <option>Ganância / Sensação de estar economizando muito</option>
                  <option>Alívio de uma dor muito forte</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Call to Action (CTA do Botão)</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-white"
                  value={formData.cta}
                  onChange={(e) => setFormData({ ...formData, cta: e.target.value })}
                >
                  <option>Compre Agora</option>
                  <option>Saiba Mais</option>
                  <option>Aproveitar Oferta</option>
                  <option>Garantir Desconto</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Button 
            className="w-full shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]" 
            size="lg" 
            onClick={generateAdCopy}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Wand2 className="w-5 h-5 mr-2" /> Gerar Textos Mágicos</>
            )}
          </Button>
        </div>

        <div className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2"><PenTool className="w-4 h-4 text-primary" /> Resultado da IA</CardTitle>
              {generatedCopy && (
                <Button variant="secondary" size="sm" onClick={copyToClipboard} className="h-7 text-xs">
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copiar
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {generatedCopy ? (
                <div className="bg-panelHover rounded-lg border border-border p-5 h-full min-h-[500px] overflow-auto custom-scrollbar">
                  <div className="text-sm text-white whitespace-pre-wrap leading-relaxed">
                    {generatedCopy}
                  </div>
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex items-center justify-center text-textSecondary text-sm border border-dashed border-border rounded-lg bg-background/50 text-center p-8">
                  Preencha os dados ao lado e veja a mágica acontecer. A IA escreverá as copies perfeitas pra você colar no TikTok Ads.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
