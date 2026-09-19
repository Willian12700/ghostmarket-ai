import { useState } from 'react'
import { Wand2, Copy, Check, TrendingUp, PenTool } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'

export const AdCopy = () => {
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
    productName: '',
    offer: '50% OFF + Frete Grátis',
    cta: 'Compre Agora',
    approach: 'Urgência / Escassez',
    emotion: 'FOMO (Medo de ficar de fora)',
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  const generatePrompt = async () => {
    setIsGenerating(true)
    try {
      const prompt = `# SYSTEM INSTRUCTION: TIKTOK ADS COPYWRITER
Você é um Especialista Sênior em Tráfego Pago e Copywriting focado em TikTok Ads.
Sua missão é criar opções de textos persuasivos (Legendas) e textos de tela (Text Overlays) para uma campanha focada em conversão extrema.

## DADOS DA CAMPANHA
- **Produto**: ${formData.productName || '[Nome do Produto]'}
- **Oferta Irresistível**: ${formData.offer}
- **Call to Action (CTA)**: ${formData.cta}
- **Ângulo da Abordagem**: ${formData.approach}
- **Emoção Alvo do Público**: ${formData.emotion}

## DIRETRIZES TIKTOK ADS
1. Textos devem ser curtos. Usuários do TikTok não leem textos longos.
2. A legenda (Caption) deve complementar o vídeo e empurrar o usuário para clicar no link.
3. Os textos de tela (Text Overlays) devem chamar atenção nos primeiros 3 segundos.
4. Utilize Emojis estrategicamente.
5. Foco 100% em conversão e clique.

## SUA TAREFA
Gere 3 (três) Variações de Anúncio Completas. Para cada variação, forneça:

**Variação X:**
- 🎬 **Texto de Tela (Primeiros 3 Segundos)**: (Uma frase forte e curta para prender a atenção na hora)
- 📝 **Legenda do Post (Caption)**: (Texto dinâmico, vendendo a oferta e direcionando para o link)
- 🔥 **Hashtags Estratégicas**: (3 a 5 hashtags focadas no nicho)

Por favor, escreva de forma persuasiva, coloquial, que soe natural na plataforma, focando na emoção alvo definida.`

      setGeneratedPrompt(prompt)
      addToast('Prompt de Copy gerado com sucesso!', 'success')
    } catch (error) {
      console.error(error)
      addToast('Erro ao gerar', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedPrompt)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast('Prompt copiado!', 'success')
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" /> Copy para Anúncios (TikTok Ads)
        </h2>
        <p className="text-textSecondary">Gere prompts de Copywriting focados em tráfego pago. Crie legendas magnéticas e textos de tela que multiplicam os cliques (CTR) e as conversões.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>A Oferta (O Produto)</CardTitle>
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
              <CardTitle>Ângulo do Anúncio (Angle)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Abordagem Principal</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
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
            onClick={generatePrompt}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Wand2 className="w-5 h-5 mr-2" /> Gerar Máquina de Copy</>
            )}
          </Button>
        </div>

        <div className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2"><PenTool className="w-4 h-4 text-primary" /> Prompt de Copy (Para IA)</CardTitle>
              {generatedPrompt && (
                <Button variant="secondary" size="sm" onClick={copyToClipboard} className="h-7 text-xs">
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  Copiar
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {generatedPrompt ? (
                <div className="bg-panelHover rounded-lg border border-border p-4 h-full min-h-[500px] overflow-auto custom-scrollbar">
                  <pre className="text-sm text-textSecondary whitespace-pre-wrap font-mono">
                    {generatedPrompt}
                  </pre>
                </div>
              ) : (
                <div className="h-full min-h-[500px] flex items-center justify-center text-textSecondary text-sm border border-dashed border-border rounded-lg bg-background/50">
                  Defina a oferta e gere sua copy ninja focada em conversão.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
