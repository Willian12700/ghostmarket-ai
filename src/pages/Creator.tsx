import { useState } from 'react'
import { Wand2, Copy, Check, MessageSquare } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'

export const Creator = () => {
  const { addToast } = useToastStore()
  
  const [activeTab, setActiveTab] = useState<'abertura' | 'followup'>('abertura')

  const [formData, setFormData] = useState({
    clientName: '',
    niche: '',
    product: '',
    offer: '',
    tone: 'Persuasivo',
    followUpReason: 'Visualizou e não respondeu'
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedScript, setGeneratedScript] = useState('')
  const [copied, setCopied] = useState(false)

  const generateScript = () => {
    setIsGenerating(true)
    
    setTimeout(() => {
      const { clientName, niche, product, offer, tone, followUpReason } = formData
      
      const firstName = clientName ? clientName.split(' ')[0] : 'Empreendedor'
      const nicheText = niche ? niche.toLowerCase() : 'negócio'
      
      let script = ''

      if (activeTab === 'abertura') {
        if (tone === 'Persuasivo') {
          script = `Fala ${firstName}, tudo bem?\n\nEstava analisando algumas empresas do setor de ${nicheText} aqui na região e o perfil de vocês me chamou muita atenção. Percebi um detalhe na estratégia de vocês que está deixando muito dinheiro na mesa.\n\nNós ajudamos empresas exatamente como a sua através de ${product || 'nossa solução'}, e o resultado costuma ser brutal na atração de novos clientes.\n\n${offer ? `Para você ter uma ideia, ${offer}.` : 'Temos uma estratégia pronta que eu gostaria de te apresentar.'}\n\nVocê teria 5 minutinhos amanhã à tarde para eu te mostrar como isso funcionaria no seu negócio, sem compromisso?`
        } else if (tone === 'Direto') {
          script = `Olá ${firstName}, vi que vocês têm um ${nicheText} de muito potencial.\n\nTrabalho com ${product || 'marketing e tecnologia'} e criei um plano de ação rápido que pode dobrar seus resultados nos próximos 30 dias.\n\n${offer ? `A nossa proposta é a seguinte: ${offer}.` : 'Se fizer sentido, podemos marcar uma call super rápida.'}\n\nComo está sua agenda para amanhã?`
        } else if (tone === 'Amigável') {
          script = `Opa ${firstName}, tudo joia?\n\nAcompanho o trabalho de vocês e acho fantástico o que estão construindo com o ${nicheText}! 🚀\n\nEu ajudo empresas do seu setor com ${product || 'estratégias de crescimento'} e lembrei de vocês na hora. ${offer ? `Nós estamos com uma oportunidade muito legal: ${offer}.` : 'Gostaria muito de trocar uma ideia rápida para te mostrar como podemos ajudar.'}\n\nFaz sentido batermos um papo rápido na semana que vem? Abraço!`
        }
      } else {
        // Logica do Follow-Up
        if (followUpReason === 'Visualizou e não respondeu') {
          script = `Opa ${firstName}, tudo bem?\n\nSei que a correria do dia a dia no ${nicheText} é grande. Conseguiu dar uma olhada na proposta que te mandei sobre ${product || 'o nosso serviço'}?\n\nTemos apenas mais 2 vagas para implementar essa estratégia neste mês. Faz sentido darmos andamento ou prefere deixar para o próximo mês?`
        } else if (followUpReason === 'Achou caro') {
          script = `Fala ${firstName}, tudo bem?\n\nFiquei pensando no que conversamos sobre o investimento para o projeto de ${product || 'tecnologia'}.\n\nSei que o fluxo de caixa é prioridade pra vocês. Conversei com a equipe e consegui bolar uma alternativa: que tal começarmos com uma versão inicial focada apenas em gerar caixa rápido? ${offer ? `Nesse formato, podemos fazer por: ${offer}.` : 'Isso reduz o investimento inicial pela metade.'}\n\nO que acha de marcarmos 5 min para eu te mostrar esse novo escopo?`
        } else if (followUpReason === 'Pediu pra ver depois') {
          script = `Olá ${firstName}, como estão as coisas?\n\nDa última vez que nos falamos, você pediu para retomarmos o contato mais pra frente.\n\nNesse meio tempo, implementamos nossa estratégia de ${product || 'vendas'} em outro ${nicheText} e o resultado foi incrível.\n\nAinda faz sentido conversarmos sobre como aplicar isso no seu negócio?\nAbraço!`
        }
      }

      setGeneratedScript(script)
      setIsGenerating(false)
      addToast('Script gerado com sucesso!', 'success')
    }, 1200)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedScript)
    setCopied(true)
    addToast('Script copiado!', 'success')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Creator IA - Scripts de Venda</h2>
        <p className="text-textSecondary">Gere mensagens de WhatsApp de alta conversão para seus leads.</p>
      </div>

      <div className="flex bg-panelHover p-1 rounded-lg w-max border border-border">
        <button
          onClick={() => setActiveTab('abertura')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'abertura' 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          Primeiro Contato (Abertura)
        </button>
        <button
          onClick={() => setActiveTab('followup')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'followup' 
              ? 'bg-primary text-white shadow-sm' 
              : 'text-textSecondary hover:text-textPrimary'
          }`}
        >
          Ressuscitar Lead (Follow-Up)
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Lead</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Nome do Lead (Opcional)"
                placeholder="Ex: João, Barbearia X"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              />
              <Input
                label="Nicho de Mercado"
                placeholder="Ex: Restaurante, Clínica, Loja de Roupas"
                value={formData.niche}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Sua Oferta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="O que você vende?"
                placeholder="Ex: Gestão de Tráfego, Automação IA, Site"
                value={formData.product}
                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-textSecondary">A Oferta (ou Nova Condição)</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-textSecondary/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                  placeholder="Ex: Vou criar seu site de graça e você só paga a hospedagem"
                  value={formData.offer}
                  onChange={(e) => setFormData({ ...formData, offer: e.target.value })}
                />
              </div>

              {activeTab === 'abertura' ? (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Tom da Mensagem</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.tone}
                    onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  >
                    <option value="Persuasivo">Persuasivo & Gatilhos Mentais</option>
                    <option value="Direto">Direto ao Ponto</option>
                    <option value="Amigável">Amigável & Relacional</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-textSecondary">Motivo do Sumiço do Lead</label>
                  <select
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    value={formData.followUpReason}
                    onChange={(e) => setFormData({ ...formData, followUpReason: e.target.value })}
                  >
                    <option value="Visualizou e não respondeu">Visualizou e não respondeu a proposta</option>
                    <option value="Achou caro">Achou caro / Sem orçamento no momento</option>
                    <option value="Pediu pra ver depois">Pediu pra retomar contato depois</option>
                  </select>
                </div>
              )}
            </CardContent>
          </Card>

          <Button 
            className="w-full" 
            size="lg" 
            onClick={generateScript}
            disabled={isGenerating || !formData.niche}
          >
            {isGenerating ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <><Wand2 className="w-5 h-5 mr-2" /> Gerar Script Perfeito</>
            )}
          </Button>
        </div>

        <div className="h-full">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Mensagem Gerada</CardTitle>
              {generatedScript && (
                <Button variant="secondary" size="sm" onClick={copyToClipboard}>
                  {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              )}
            </CardHeader>
            <CardContent className="flex-1">
              {generatedScript ? (
                <div className="bg-panelHover rounded-lg border border-border p-5 h-full min-h-[400px] overflow-auto">
                  <pre className="text-[15px] leading-relaxed text-textPrimary whitespace-pre-wrap font-sans">
                    {generatedScript}
                  </pre>
                </div>
              ) : (
                <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-textSecondary border-2 border-dashed border-border rounded-lg bg-background/50">
                  <MessageSquare className="w-12 h-12 mb-4 text-borderHover" />
                  <p className="text-center px-4">Preencha o nicho e sua oferta para a IA escrever a mensagem de WhatsApp perfeita.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
