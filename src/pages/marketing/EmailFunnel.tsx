import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Wand2, Copy, Check } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'


export const EmailFunnel = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState('')
  const [copied, setCopied] = useState(false)
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
    product: '',
    funnelType: '',
    emails: ''
  })

  const handleGenerate = async () => {
    if (!formData.product) { addToast('Preencha todos os campos', 'error'); return; }
    if (!formData.funnelType) { addToast('Preencha todos os campos', 'error'); return; }
    if (!formData.emails) { addToast('Preencha todos os campos', 'error'); return; }

    setIsGenerating(true)
    addToast('A IA está analisando e gerando o conteúdo...', 'success')

    const prompt = `Você é um Copywriter especialista em E-mail Marketing e automação (nível gringo).
Crie um Funil de E-mails do tipo "${formData.funnelType}" para vender o produto: "${formData.product}".
A sequência deve conter ${formData.emails} e-mails.

PARA CADA E-MAIL, FORNEÇA:
- [Assunto] (Pelo menos 2 opções de assuntos persuasivos, com taxa de abertura alta)
- [Corpo do E-mail] (O texto escrito de forma pessoal, como se estivesse conversando com um amigo, gerando conexão e curiosidade)
- [Call to Action / Link] (Instrução clara do que ele deve clicar)
- [Gatilho Mental Utilizado] (Explique qual gatilho você usou neste e-mail)

Faça uma progressão lógica. O primeiro e-mail introduz/lembra, o segundo gera desejo/quebra objeção, e o último aplica escassez/urgência máxima. Formate com Markdown.`

    try {
      // Usando o proxy free Pollinations que já temos na API
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
      
      setGeneratedResult(text)
      setCopied(false)
      addToast('Conteúdo gerado com sucesso!', 'success')
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
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white">Funil de E-mail Marketing</h2>
        <p className="text-textSecondary mt-2">Gere sequências automáticas de e-mails para Boas-vindas, Recuperação e Vendas.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-panel/50">
          <CardHeader>
            <CardTitle className="text-xl text-white">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Nome do Produto</label>
                  <Input 
                    value={formData.product} 
                    onChange={e => setFormData({ ...formData, product: e.target.value })}
                    placeholder="Ex: Curso de Inglês"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Tipo de Funil</label>
                  <Input 
                    value={formData.funnelType} 
                    onChange={e => setFormData({ ...formData, funnelType: e.target.value })}
                    placeholder="Ex: Carrinho Abandonado, Boas-Vindas..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Quantos E-mails?</label>
                  <Input 
                    value={formData.emails} 
                    onChange={e => setFormData({ ...formData, emails: e.target.value })}
                    placeholder="Ex: 3"
                  />
                </div>

            <Button 
              className="w-full mt-6 shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span className="animate-pulse">Gerando Conteúdo...</span>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" /> Gerar com IA</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-panel/50 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-4">
            <CardTitle className="text-xl text-white">Resultado</CardTitle>
            {generatedResult && (
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-textSecondary" />}
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1">
            {generatedResult ? (
              <div className="bg-background rounded-lg p-6 border border-border/50 h-[500px] overflow-y-auto custom-scrollbar prose prose-invert max-w-none">
                <div className="whitespace-pre-wrap">{generatedResult}</div>
              </div>
            ) : (
              <div className="h-[500px] flex items-center justify-center border-2 border-dashed border-border/50 rounded-lg">
                <p className="text-textSecondary text-center max-w-xs">
                  Preencha os dados e clique em "Gerar" para ver a mágica da IA acontecer.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
