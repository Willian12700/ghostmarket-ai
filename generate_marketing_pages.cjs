const fs = require('fs');

const templates = [
  {
    name: 'VslGenerator',
    title: 'Fábrica de VSLs',
    desc: 'Crie roteiros cinematográficos de Vídeos de Vendas (VSL) de alta conversão.',
    fields: [
      { id: 'productName', label: 'Nome do Produto', placeholder: 'Ex: Método Queima 30D' },
      { id: 'niche', label: 'Nicho/Mercado', placeholder: 'Ex: Emagrecimento, Finanças...' },
      { id: 'pain', label: 'Principal Dor do Cliente', placeholder: 'Ex: Tenta fazer dieta mas desiste' },
      { id: 'mechanism', label: 'Mecanismo Único', placeholder: 'Ex: Ativação Metabólica Noturna' }
    ],
    prompt: `Você é o Copywriter mais caro do Brasil, especialista em VSLs (Video Sales Letters) de múltiplos 8 dígitos.
Crie um roteiro de VSL completo para o produto "\${formData.productName}" (Nicho: \${formData.niche}).
A dor principal do cliente é: "\${formData.pain}".
O Mecanismo Único (o segredo da solução) é: "\${formData.mechanism}".

ESTRUTURA DO ROTEIRO:
1. THE LEAD (O Gancho/Promessa): Chame atenção nos primeiros 10 segundos. Prometa a solução para a dor.
2. A HISTÓRIA (Jornada do Herói): Uma história emocional de fracasso antes de descobrir o mecanismo.
3. O MECANISMO ÚNICO: Explique cientificamente/logicamente como a solução funciona.
4. A OFERTA: Apresente o produto e os bônus.
5. ANCORAGEM DE PREÇO & CTA: Diga o preço original (caro) e o preço atual (irresistível), com chamada pra ação clara.
6. GARANTIA & ESCASSEZ.

Formate o texto em Markdown (use negritos, títulos).`
  },
  {
    name: 'PlrGenerator',
    title: 'Máquina de PLR / E-books',
    desc: 'Gere a estrutura completa, títulos e capítulos para seu Info-produto.',
    fields: [
      { id: 'theme', label: 'Tema Principal', placeholder: 'Ex: Culinária Vegana Prática' },
      { id: 'target', label: 'Para quem é?', placeholder: 'Ex: Mães sem tempo' },
      { id: 'chapters', label: 'Quantidade de Capítulos', placeholder: 'Ex: 5, 10, 12...' },
    ],
    prompt: `Você é um produtor de Info-produtos best-seller na Hotmart/Kiwify.
Crie a estrutura completa de um E-book (PLR) sobre: "\${formData.theme}".
Público-alvo: "\${formData.target}".
Quantidade de Capítulos: "\${formData.chapters}".

ME ENTREGUE:
1. 5 OPÇÕES DE TÍTULOS MAGNÉTICOS (Muito persuasivos e fáceis de vender).
2. A PROMESSA PRINCIPAL (O que o leitor vai alcançar no final do livro).
3. O ÍNDICE COMPLETO (Nome de cada capítulo e 2 tópicos do que será abordado dentro dele).
4. UM ESBOÇO DO CAPÍTULO 1 (Para eu já começar a diagramar no Canva).

Formate o texto de forma limpa, usando Markdown.`
  },
  {
    name: 'AdsGenerator',
    title: 'Gerador de Anúncios (Meta/Google)',
    desc: 'Crie Copies validadas e ideias de criativos para Facebook, Instagram e Google Ads.',
    fields: [
      { id: 'product', label: 'Produto/Serviço', placeholder: 'Ex: Mentoria de Vendas' },
      { id: 'offer', label: 'Qual é a Oferta?', placeholder: 'Ex: 50% de Desconto hoje' },
      { id: 'objection', label: 'Maior Objeção do Cliente', placeholder: 'Ex: Acha que é muito caro' },
    ],
    prompt: `Você é o maior Gestor de Tráfego e Copywriter de Anúncios do Brasil (nível Pedro Sobral/Tiago Tessmann).
Crie um conjunto de anúncios (Meta Ads / Instagram / Google Ads) para o produto: "\${formData.product}".
A oferta atual é: "\${formData.offer}".
A maior objeção do público é: "\${formData.objection}".

ME ENTREGUE EXATAMENTE:
1. COPY 1 (DIRETA): Focada em quem já quer comprar. Fale do desconto/oferta.
2. COPY 2 (STORYTELLING): Focada em quebrar a objeção principal contando uma mini-história.
3. COPY 3 (CURIOSIDADE): Texto curto, focado em gerar clique barato (CTR alto).
4. IDEIA DE CRIATIVO 1: O que deve estar escrito na Imagem?
5. IDEIA DE CRIATIVO 2: O que a pessoa deve gravar no Vídeo? (Roteiro curto).
6. SEGMENTAÇÃO DE PÚBLICO: Sugira 3 interesses para colocar no Gerenciador de Anúncios.

Formate em Markdown.`
  },
  {
    name: 'EmailFunnel',
    title: 'Funil de E-mail Marketing',
    desc: 'Gere sequências automáticas de e-mails para Boas-vindas, Recuperação e Vendas.',
    fields: [
      { id: 'product', label: 'Nome do Produto', placeholder: 'Ex: Curso de Inglês' },
      { id: 'funnelType', label: 'Tipo de Funil', placeholder: 'Ex: Carrinho Abandonado, Boas-Vindas...' },
      { id: 'emails', label: 'Quantos E-mails?', placeholder: 'Ex: 3' },
    ],
    prompt: `Você é um Copywriter especialista em E-mail Marketing e automação (nível gringo).
Crie um Funil de E-mails do tipo "\${formData.funnelType}" para vender o produto: "\${formData.product}".
A sequência deve conter \${formData.emails} e-mails.

PARA CADA E-MAIL, FORNEÇA:
- [Assunto] (Pelo menos 2 opções de assuntos persuasivos, com taxa de abertura alta)
- [Corpo do E-mail] (O texto escrito de forma pessoal, como se estivesse conversando com um amigo, gerando conexão e curiosidade)
- [Call to Action / Link] (Instrução clara do que ele deve clicar)
- [Gatilho Mental Utilizado] (Explique qual gatilho você usou neste e-mail)

Faça uma progressão lógica. O primeiro e-mail introduz/lembra, o segundo gera desejo/quebra objeção, e o último aplica escassez/urgência máxima. Formate com Markdown.`
  }
];

templates.forEach(t => {
  const stateVars = t.fields.map(f => `    ${f.id}: ''`).join(',\n');
  const validations = t.fields.map(f => `    if (!formData.${f.id}) { addToast('Preencha todos os campos', 'error'); return; }`).join('\n');
  const inputs = t.fields.map(f => `
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">${f.label}</label>
                  <Input 
                    value={formData.${f.id}} 
                    onChange={e => setFormData({ ...formData, ${f.id}: e.target.value })}
                    placeholder="${f.placeholder}"
                  />
                </div>`).join('\n');

  const content = `import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Wand2, Copy, Check } from 'lucide-react'
import { useToastStore } from '@/store/toastStore'
import ReactMarkdown from 'react-markdown'

export const ${t.name} = () => {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedResult, setGeneratedResult] = useState('')
  const [copied, setCopied] = useState(false)
  const { addToast } = useToastStore()
  
  const [formData, setFormData] = useState({
${stateVars}
  })

  const handleGenerate = async () => {
${validations}

    setIsGenerating(true)
    addToast('A IA está analisando e gerando o conteúdo...', 'success')

    const prompt = \`${t.prompt}\`

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
        <h2 className="text-3xl font-bold tracking-tight text-white">${t.title}</h2>
        <p className="text-textSecondary mt-2">${t.desc}</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-border/50 bg-panel/50">
          <CardHeader>
            <CardTitle className="text-xl text-white">Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
${inputs}

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
                <ReactMarkdown>{generatedResult}</ReactMarkdown>
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
`;

  fs.writeFileSync('src/pages/marketing/' + t.name + '.tsx', content, 'utf8');
});

console.log('Marketing pages generated.');
