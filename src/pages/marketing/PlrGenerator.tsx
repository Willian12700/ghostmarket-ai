import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Wand2, Copy, Check, Download } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'

export const PlrGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState('')
  const [copied, setCopied] = useState(false)
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
    theme: '',
    target: '',
    chapters: '5',
  })

  const handleGenerate = async () => {
    if (!formData.theme) { addToast('Preencha o tema', 'error'); return; }
    if (!formData.target) { addToast('Preencha o público-alvo', 'error'); return; }
    if (!formData.chapters) { addToast('Preencha os capítulos', 'error'); return; }

    setIsGenerating(true)
    addToast('Escrevendo E-book completo... Isso pode levar até 1 minuto.', 'success')

    const prompt = `Você é um autor Best-Seller e Copywriter focado em conversão.
Escreva o CONTEÚDO COMPLETO de um E-book sobre: "${formData.theme}".
O público-alvo é: "${formData.target}".
O livro deve ter aproximadamente ${formData.chapters} capítulos.

ESTRUTURA OBRIGATÓRIA:
1. TÍTULO OFICIAL: Dê um título extremamente persuasivo no estilo best-seller.
2. INTRODUÇÃO: Uma abertura emocional conectando com a dor do leitor e prometendo a solução.
3. DESENVOLVIMENTO: Escreva o conteúdo extenso e rico de CADA UM dos ${formData.chapters} capítulos. Não resuma. Desenvolva o texto de forma didática, como um livro real que será vendido.
4. CONCLUSÃO: Um fechamento inspirador com um passo a passo final.

AVISO: Este é um produto real que será entregue aos clientes. ENTREGUE O TEXTO COMPLETO E DENSO DOS CAPÍTULOS, não apenas um esboço.
Formate tudo com Markdown (H1 para Título, H2 para Capítulos, etc).`

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
      
      setGeneratedResult(text)
      setCopied(false)
      addToast('E-book escrito com sucesso!', 'success')
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

  const exportToPDF = () => {
    if (!generatedResult) return;
    
    // Converte markdown básico para HTML apenas para o print
    // Substituições bem básicas para H1, H2, Bold, etc.
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          Máquina de PLR / E-books
        </h2>
        <p className="text-textSecondary mt-2">
          Gere o conteúdo <strong>completo</strong> do seu Info-produto em segundos e exporte direto para PDF.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        <Card className="border-border/50 bg-panel/50 lg:col-span-4 h-fit">
          <CardHeader>
            <CardTitle className="text-xl text-white">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Tema Principal</label>
                  <Input 
                    value={formData.theme} 
                    onChange={e => setFormData({ ...formData, theme: e.target.value })}
                    placeholder="Ex: Receitas Low Carb, Gestão de Tempo"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Para quem é? (Público)</label>
                  <Input 
                    value={formData.target} 
                    onChange={e => setFormData({ ...formData, target: e.target.value })}
                    placeholder="Ex: Mães solteiras, Estudantes"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Qtd de Capítulos</label>
                  <Input 
                    type="number"
                    value={formData.chapters} 
                    onChange={e => setFormData({ ...formData, chapters: e.target.value })}
                    placeholder="Ex: 5"
                    min="1" max="15"
                  />
                </div>

            <Button 
              className="w-full mt-6 shadow-[0_0_15px_rgba(139,92,246,0.3)]" 
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <span className="animate-pulse">Escrevendo Livro...</span>
              ) : (
                <><Wand2 className="w-4 h-4 mr-2" /> Escrever E-book</>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-panel/50 flex flex-col lg:col-span-8">
          <CardHeader className="flex flex-row items-center justify-between py-4 border-b border-border/30">
            <CardTitle className="text-xl text-white">Livro Gerado</CardTitle>
            {generatedResult && (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={copyToClipboard} title="Copiar Texto">
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-textSecondary" />}
                </Button>
                <Button variant="primary" size="sm" onClick={exportToPDF} className="bg-primary hover:bg-primaryLight text-white font-bold">
                  <Download className="w-4 h-4 mr-2" /> Baixar PDF
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-1 p-0">
            {generatedResult ? (
              <div className="bg-[#fdfdfd] text-[#222] p-8 h-[600px] overflow-y-auto custom-scrollbar font-serif leading-relaxed" style={{ fontSize: '16px' }}>
                <div dangerouslySetInnerHTML={{ __html: generatedResult
                  .replace(/^# (.*$)/gim, '<h1 style="font-size: 2em; font-weight: bold; margin-bottom: 0.5em; font-family: sans-serif;">$1</h1>')
                  .replace(/^## (.*$)/gim, '<h2 style="font-size: 1.5em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; font-family: sans-serif;">$1</h2>')
                  .replace(/^### (.*$)/gim, '<h3 style="font-size: 1.17em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; font-family: sans-serif;">$1</h3>')
                  .replace(/\\*\\*(.*?)\\*\\*/gim, '<strong>$1</strong>')
                  .replace(/\\*(.*?)\\*/gim, '<em>$1</em>')
                  .replace(/\\n/g, '<br>')
                }} />
              </div>
            ) : (
              <div className="h-[600px] flex items-center justify-center bg-background/50">
                <p className="text-textSecondary text-center max-w-sm">
                  O conteúdo do seu E-book aparecerá aqui. Ele já vem formatado como um livro profissional para você baixar.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
