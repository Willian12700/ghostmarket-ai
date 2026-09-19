import { useState } from 'react'
import { Wand2, Copy, Check, Video, PenTool } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export const ViralScripts = () => {
  const { addToast } = useToastStore()
  const { user } = useAuthStore()
  
  const [formData, setFormData] = useState({
    productName: '',
    benefits: '',
    hookType: 'Dor / Solução',
    videoLength: '30 segundos (Recomendado)',
    tone: 'Amigável / Recomendação Sincera',
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState('')
  const [copied, setCopied] = useState(false)

  const generatePrompt = async () => {
    setIsGenerating(true)
    try {
      const prompt = `# SYSTEM INSTRUCTION: TIKTOK VIRAL SCRIPT EXPERT
Você é um Estrategista de TikTok e Especialista em Copywriting Direto (DR) focado no TikTok Shop.
Sua missão é criar o roteiro mais engajador e de altíssima conversão possível.

## DETALHES DO PRODUTO
- **Produto**: ${formData.productName || '[Nome do Produto]'}
- **Principais Benefícios**: ${formData.benefits || '[Benefícios do Produto]'}

## ESPECIFICAÇÕES DO VÍDEO
- **Formato**: Vídeo Vertical UGC (User Generated Content)
- **Tempo estimado**: ${formData.videoLength}
- **Gatilho Principal (Hook)**: ${formData.hookType}
- **Tom de Voz da Persona**: ${formData.tone}

## ESTRUTURA OBRIGATÓRIA DO ROTEIRO
1. **HOOK (0-3s)**: Um gancho visceral e impossível de ignorar. Deve quebrar o padrão visual e prender o espectador imediatamente.
2. **RETENÇÃO (3-10s)**: Construção do desejo ou agravamento da dor. Use storytelling rápido.
3. **APRESENTAÇÃO (10-20s)**: O produto como o "santo graal" que resolve o problema (mostre o produto em uso, se possível).
4. **CALL TO ACTION (Últimos 5s)**: Instrução clara e irresistível mandando clicar no carrinho amarelo (TikTok Shop) antes que esgote.

**IMPORTANTE**: Divida o roteiro em formato de tabela com duas colunas: [O QUE MOSTRAR NA TELA (Visual)] | [O QUE FALAR (Áudio)]. Escreva falas curtas, coloquiais e respiráveis.

AGORA, ESCREVA O ROTEIRO COMPLETO:`

      setGeneratedPrompt(prompt)
      
      if (user?.email) {
        await addDoc(collection(db, 'tiktok_scripts_history'), {
          userEmail: user.email,
          createdAt: serverTimestamp(),
          productName: formData.productName,
          hookType: formData.hookType,
          prompt
        })
      }

      addToast('Prompt gerado com sucesso!', 'success')
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
          <Video className="w-6 h-6 text-primary" /> Roteiros Virais (TikTok)
        </h2>
        <p className="text-textSecondary">Gere prompts de Copywriting de Elite para o ChatGPT criar scripts de altíssima conversão para seus vídeos do TikTok Shop.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sobre o Produto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome do Produto"
                placeholder="Ex: Ring Light 4k Portátil"
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
              />

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Principais Benefícios (O que ele faz?)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Ex: Ilumina muito bem, cabe no bolso, bateria dura 10 horas."
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estratégia do Vídeo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">Tipo de Gancho (Hook)</label>
                <select
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  value={formData.hookType}
                  onChange={(e) => setFormData({ ...formData, hookType: e.target.value })}
                >
                  <option>Dor / Solução (Foca em resolver um problema)</option>
                  <option>Curiosidade Absurda (Quebra de padrão visual)</option>
                  <option>Prova Social (Mostrar resultado antes e depois)</option>
                  <option>Unboxing Satisfatório (ASMR e revelação)</option>
                  <option>Polêmica / "Eles mentiram pra você"</option>
                  <option>Storytelling (Minha jornada usando o produto)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Duração do Vídeo</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.videoLength}
                    onChange={(e) => setFormData({ ...formData, videoLength: e.target.value })}
                  >
                    <option>Curto (15 segundos)</option>
                    <option>30 segundos (Recomendado)</option>
                    <option>Longo (60 segundos)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Tom de Voz</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  >
                    <option>Amigável / Recomendação Sincera</option>
                    <option>Urgência / Escassez</option>
                    <option>Engraçado / Memes</option>
                    <option>Autoridade / Especialista</option>
                  </select>
                </div>
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
              <><Wand2 className="w-5 h-5 mr-2" /> Gerar Prompt Estratégico</>
            )}
          </Button>
        </div>

        <div className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base flex items-center gap-2"><PenTool className="w-4 h-4 text-primary" /> Prompt Gerado (Para IA)</CardTitle>
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
                  Preencha os dados e clique em gerar para ver o mega prompt aqui.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
