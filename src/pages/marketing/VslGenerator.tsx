import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Wand2, Copy, Check } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'


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

  const handleGenerate = async () => {
    if (!formData.productName) { addToast('Preencha todos os campos', 'error'); return; }
    if (!formData.niche) { addToast('Preencha todos os campos', 'error'); return; }
    if (!formData.pain) { addToast('Preencha todos os campos', 'error'); return; }
    if (!formData.mechanism) { addToast('Preencha todos os campos', 'error'); return; }

    setIsGenerating(true)
    addToast('A IA está analisando e gerando o conteúdo...', 'success')

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
        <h2 className="text-3xl font-bold tracking-tight text-white">Fábrica de VSLs</h2>
        <p className="text-textSecondary mt-2">Crie roteiros cinematográficos de Vídeos de Vendas (VSL) de alta conversão.</p>
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
                  <label className="text-sm font-medium text-textSecondary">Principal Dor do Cliente</label>
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
