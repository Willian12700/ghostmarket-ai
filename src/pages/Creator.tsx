import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Wand2,
  Copy,
  Check,
  MessageCircle,
  Sparkles,
  RefreshCw,
  User,
  Briefcase,
  Phone,
  MapPin,
  Layers,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToastStore } from '@/store/toastStore'
import { useAuthStore } from '@/store/authStore'
import { db } from '@/config/firebase'

interface ScriptVariation {
  id: string
  label: string
  badge: string
  text: string
}

const MESSAGE_TYPES = [
  'Primeiro Contato (Prospecção)',
  'Follow-Up (Visualizou e sumiu)',
  'Quebra de Objeção (Achou caro)',
  'Apresentação de Prévia / Site'
]

const TONES = ['Consultivo & Executivo', 'Curto & Direto', 'Persuasivo (Dor & Solução)', 'Amigável & Próximo']

const QUICK_PRODUCTS = [
  'Landing Page de Alta Conversão',
  'Site Profissional + Chatbot IA 24h',
  'Posicionamento no Google + Site',
  'Reestruturação Digital Completa'
]

export const Creator = () => {
  const [searchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()

  const [formData, setFormData] = useState({
    type: 'Primeiro Contato (Prospecção)',
    clientName: '',
    phone: '',
    niche: '',
    city: '',
    product: 'Landing Page de Alta Conversão',
    offer: '',
    tone: 'Consultivo & Executivo'
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [variations, setVariations] = useState<ScriptVariation[]>([])
  const [activeTab, setActiveTab] = useState<number>(0)
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null)

  useEffect(() => {
    const clientName = searchParams.get('clientName') || ''
    const niche = searchParams.get('niche') || ''
    const phone = searchParams.get('phone') || ''
    const city = searchParams.get('city') || ''

    if (clientName || niche || phone || city) {
      setFormData(prev => ({
        ...prev,
        clientName: clientName || prev.clientName,
        niche: niche || prev.niche,
        phone: phone || prev.phone,
        city: city || prev.city
      }))
    }
  }, [searchParams])

  const buildSmartFallbackVariations = (): ScriptVariation[] => {
    const { type, clientName, niche, city, product, offer, tone } = formData
    const targetName = clientName.trim() ? clientName.trim() : 'tudo bem'
    const firstWord = clientName.trim() ? clientName.trim().split(' ')[0] : 'Olá'
    const nicheLabel = niche.trim() ? niche.trim().toLowerCase() : 'seu segmento'
    const cityLabel = city.trim() ? ` em ${city.trim()}` : ''
    const productLabel = product.trim() || 'uma estrutura digital de alta conversão'
    const offerSentence = offer.trim()
      ? `\n\nInclusive, ${offer.trim()}.`
      : '\n\nMontei uma prévia personalizada mostrando exatamente como ficaria para a estrutura de vocês.'

    if (type.includes('Follow-Up')) {
      return [
        {
          id: 'v1',
          label: 'Variação 01 • Toque Rápido (Alta Resposta)',
          badge: 'CURTA',
          text: `Olá, ${firstWord}! Tudo bem?\n\nSei que a rotina no setor de ${nicheLabel} é corrida. Conseguiu dar uma olhada na mensagem anterior sobre ${productLabel}?\n\nSe fizer sentido, consigo separar 5 minutos hoje para te mostrar a estrutura funcionando na prática.`
        },
        {
          id: 'v2',
          label: 'Variação 02 • Fechamento de Agenda',
          badge: 'CONSULTIVA',
          text: `Fala, ${firstWord}! Passando rapidamente porque estamos fechando o cronograma de entregas desta semana para empresas de ${nicheLabel}${cityLabel}.\n\nAinda tenho 1 vaga disponível para implementar ${productLabel} com acompanhamento direto.${offerSentence}\n\nQuer que eu reserve para a ${targetName} ou deixamos para o próximo mês?`
        },
        {
          id: 'v3',
          label: 'Variação 03 • Sem Compromisso (Desbloqueio)',
          badge: 'DIRETA',
          text: `${firstWord}, tudo ótimo por aí?\n\nPara facilitar sua análise sem tomar seu tempo: posso te mandar um link rápido de demonstração de ${productLabel} aqui mesmo no WhatsApp para você abrir quando tiver 2 minutos?`
        }
      ]
    }

    if (type.includes('Objeção')) {
      return [
        {
          id: 'v1',
          label: 'Variação 01 • Retorno sobre Investimento (ROI)',
          badge: 'ROI & CAIXA',
          text: `${firstWord}, entendo perfeitamente sua cautela com o investimento.\n\nJustamente por isso estruturamos ${productLabel} para se pagar já nos primeiros clientes que chegarem pelo Google e WhatsApp. No setor de ${nicheLabel}, apenas 2 ou 3 novos fechamentos já cobrem 100% da implementação.${offerSentence}\n\nSe ajustarmos a condição de entrada, faz sentido avançarmos hoje?`
        },
        {
          id: 'v2',
          label: 'Variação 02 • Escopo Enxuto (Entrada Facilitada)',
          badge: 'FLEXÍVEL',
          text: `Fala, ${firstWord}! Fiquei pensando no que conversamos sobre o projeto da ${targetName}.\n\nPara não pesar no seu fluxo de caixa agora, consigo liberar uma versão inicial focada 100% em captação imediata no WhatsApp, reduzindo o investimento inicial.\n\nTopa validar esse formato mais enxuto para começarmos a gerar resultado já nesta semana?`
        },
        {
          id: 'v3',
          label: 'Variação 03 • Comparativo de Custo de Oportunidade',
          badge: 'EXECUTIVA',
          text: `Olá, ${firstWord}. Analisando a busca por ${nicheLabel}${cityLabel}, dezenas de clientes pesquisam diariamente no Google e acabam fechando com concorrentes que possuem página estruturada.\n\nO objetivo de ${productLabel} é estancar essa perda de clientes todos os meses. Posso te apresentar uma condição especial no PIX ou parcelado para destravarmos isso hoje?`
        }
      ]
    }

    return [
      {
        id: 'v1',
        label: 'Variação 01 • Quebra-Gelo de Alta Resposta (Sem cara de robô)',
        badge: 'RECOMENDADA',
        text: `Olá, pessoal da ${targetName}! Tudo bem?\n\nEstava pesquisando por referências de ${nicheLabel}${cityLabel} no Google e encontrei o perfil de vocês.\n\nNotei um ponto importante na presença digital de vocês que pode estar fazendo clientes prontos para comprar irem para a concorrência. Trabalho com ${productLabel} e preparei uma ideia rápida específica para a ${targetName}.\n\nPosso mandar um print/link aqui mesmo no WhatsApp para você avaliar sem compromisso?`
      },
      {
        id: 'v2',
        label: `Variação 02 • Abordagem ${tone.split(' ')[0]} (Autoridade & Diagnóstico)`,
        badge: 'CONSULTIVA',
        text: `Olá, ${firstWord}! Tudo ótimo?\n\nVi que a ${targetName} tem ótimas avaliações e uma excelente reputação em ${nicheLabel}${cityLabel}, mas hoje quem pesquisa pelo serviço de vocês no Google não encontra uma página de alta conversão dedicada para atendimento rápido.\n\nNós implementamos ${productLabel} para transformar essas buscas em chamados qualificados direto no seu WhatsApp.${offerSentence}\n\nVocê é a pessoa responsável pela parte comercial da ${targetName} para eu te mostrar como funciona em 2 minutos?`
      },
      {
        id: 'v3',
        label: 'Variação 03 • Abordagem da Prévia Pronta (Gatilho da Curiosidade)',
        badge: 'ALTA CONVERSÃO',
        text: `Opa, tudo bem por aí?\n\nSou especialista em estrutura digital para ${nicheLabel} e tomei a liberdade de montar um modelo demonstrativo de ${productLabel} com o nome da ${targetName} para você ver como ficaria no celular dos seus clientes.${offerSentence}\n\nFicou bem profissional! Posso te enviar o link de visualização aqui para você me dizer o que achou?`
      }
    ]
  }

  const handleGenerate = async () => {
    if (!formData.niche.trim() && !formData.clientName.trim()) {
      addToast('Informe pelo menos o nome da empresa ou o nicho de atuação.', 'error')
      return
    }

    setIsGenerating(true)
    const fallbackList = buildSmartFallbackVariations()

    try {
      const prompt = `Você é um especialista sênior em vendas B2B pelo WhatsApp no Brasil.
Gere 3 abordagens altamente persuasivas, humanas e naturais para WhatsApp (sem parecer robô, sem hashtags, sem clichês de IA).
Dados do Lead:
- Empresa/Cliente: ${formData.clientName || 'Empresa local'}
- Nicho: ${formData.niche || 'Negócio local'}
- Cidade: ${formData.city || 'Brasil'}
- Objetivo: ${formData.type}
- Solução vendida: ${formData.product}
- Oferta/Diferencial: ${formData.offer || 'Demonstração prática rápida'}
- Tom de voz: ${formData.tone}

Retorne EXATAMENTE no formato JSON abaixo (apenas o array JSON válido, sem markdown):
[
  {"label": "Variação 01 • Quebra-Gelo Rápido (Alta Resposta)", "badge": "RECOMENDADA", "text": "..."},
  {"label": "Variação 02 • Diagnóstico Consultivo (Autoridade)", "badge": "CONSULTIVA", "text": "..."},
  {"label": "Variação 03 • Abordagem da Prévia Pronta (Curiosidade)", "badge": "DIRETA", "text": "..."}
]`

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6500)

      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'Responda apenas com um JSON array válido contendo 3 objetos com label, badge e text em português do Brasil.' },
            { role: 'user', content: prompt }
          ],
          model: 'openai'
        }),
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      let finalVariations = fallbackList

      if (response.ok) {
        const rawText = await response.text()
        const jsonMatch = rawText.match(/\[[\s\S]*\]/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          if (Array.isArray(parsed) && parsed.length >= 2 && parsed[0]?.text) {
            finalVariations = parsed.slice(0, 3).map((item: any, idx: number) => ({
              id: `v${idx + 1}`,
              label: item.label || fallbackList[idx]?.label || `Variação 0${idx + 1}`,
              badge: item.badge || fallbackList[idx]?.badge || 'PRO',
              text: String(item.text).replace(/\\n/g, '\n')
            }))
          }
        }
      }

      setVariations(finalVariations)
      setActiveTab(0)
      addToast('3 variações geradas com sucesso!', 'success')

      if (user?.email) {
        try {
          const { addDoc, collection, serverTimestamp } = await import('firebase/firestore')
          await addDoc(collection(db, 'ai_history'), {
            userId: user.email,
            type: formData.type,
            niche: formData.niche || 'Geral',
            clientName: formData.clientName || '',
            script: finalVariations[0].text,
            timestamp: serverTimestamp()
          })
        } catch (err) {
          console.error('Erro ao salvar histórico:', err)
        }
      }
    } catch {
      setVariations(fallbackList)
      setActiveTab(0)
      addToast('3 variações estratégicas geradas!', 'success')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text)
    setCopiedIdx(idx)
    addToast('Script copiado para a área de transferência!', 'success')
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const handleSendWhatsApp = (text: string) => {
    const cleanPhone = formData.phone.replace(/\D/g, '')
    const encoded = encodeURIComponent(text)
    if (cleanPhone) {
      const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`
      window.open(`https://wa.me/${fullPhone}?text=${encoded}`, '_blank')
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank')
    }
  }

  const handleUpdateVariationText = (idx: number, newText: string) => {
    setVariations(prev => prev.map((v, i) => (i === idx ? { ...v, text: newText } : v)))
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono uppercase tracking-wider mb-2">
            <Wand2 className="w-3 h-3 text-zinc-300" />
            <span>Copywriting Comercial B2B</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Creator IA — Gerador Multi-Abordagem</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure os dados do lead e gere simultaneamente 3 variações estratégicas prontas para disparar no WhatsApp.
          </p>
        </div>
      </div>

      {/* Main Split Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Configuration Form (5 cols) */}
        <div className="lg:col-span-5 bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-5 sm:p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3.5">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              <span>Parâmetros da Abordagem</span>
            </h2>
            <span className="text-[10px] font-mono text-zinc-500 uppercase">Contexto do Lead</span>
          </div>

          {/* Momento / Objetivo */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Objetivo da Mensagem</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MESSAGE_TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, type: t }))}
                  className={`text-left px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    formData.type === t
                      ? 'bg-zinc-100 text-zinc-950 border-white font-semibold'
                      : 'bg-[#09090B] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dados do Lead */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-500" />
                Nome da Empresa / Sócio
              </label>
              <Input
                value={formData.clientName}
                onChange={e => setFormData(p => ({ ...p, clientName: e.target.value }))}
                placeholder="Ex: Clínica Odonto Prime"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-500" />
                WhatsApp do Lead
              </label>
              <Input
                value={formData.phone}
                onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                Nicho / Segmento *
              </label>
              <Input
                value={formData.niche}
                onChange={e => setFormData(p => ({ ...p, niche: e.target.value }))}
                placeholder="Ex: Odontologia, Barbearia..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                Cidade / Região
              </label>
              <Input
                value={formData.city}
                onChange={e => setFormData(p => ({ ...p, city: e.target.value }))}
                placeholder="Ex: São Paulo"
              />
            </div>
          </div>

          {/* Solução Vendida */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">O que você está oferecendo?</label>
            <Input
              value={formData.product}
              onChange={e => setFormData(p => ({ ...p, product: e.target.value }))}
              placeholder="Ex: Landing Page de Alta Conversão + Chatbot IA"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_PRODUCTS.map(prod => (
                <button
                  key={prod}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, product: prod }))}
                  className={`text-[11px] px-2 py-1 rounded-md border transition-colors cursor-pointer ${
                    formData.product === prod
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-[#09090B] text-zinc-500 border-zinc-800/80 hover:text-zinc-300'
                  }`}
                >
                  {prod}
                </button>
              ))}
            </div>
          </div>

          {/* Diferencial / Oferta */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Oferta ou Gatilho Específico (Opcional)
            </label>
            <Input
              value={formData.offer}
              onChange={e => setFormData(p => ({ ...p, offer: e.target.value }))}
              placeholder="Ex: Já montei uma prévia gratuita do site de vocês para demonstrar"
            />
          </div>

          {/* Tom de Voz */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">Tom da Abordagem</label>
            <div className="grid grid-cols-2 gap-2">
              {TONES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, tone: t }))}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    formData.tone === t
                      ? 'bg-zinc-800 text-white border-zinc-600'
                      : 'bg-[#09090B] text-zinc-400 border-zinc-800 hover:text-zinc-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <Button onClick={handleGenerate} disabled={isGenerating} className="w-full h-11 text-sm font-semibold">
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Gerando 3 Variações com IA...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Gerar 3 Variações de Abordagem
              </>
            )}
          </Button>
        </div>

        {/* RIGHT COLUMN: 3 Strategic Variations Output (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {variations.length === 0 ? (
            <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-10 text-center min-h-[480px] flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 mb-4">
                <Wand2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-zinc-200 mb-1.5">
                Pronto para gerar suas abordagens personalizadas
              </h3>
              <p className="text-xs text-zinc-500 max-w-md leading-relaxed mb-6">
                Preencha os dados do cliente ao lado (ou clique em <strong className="text-zinc-300">"Abordar com IA"</strong> direto no Scanner de Leads / CRM) para criar 3 opções de scripts prontos para enviar no WhatsApp.
              </p>
              <Button variant="secondary" onClick={handleGenerate} className="text-xs">
                Gerar Exemplo Agora
              </Button>
            </div>
          ) : (
            <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-5 sm:p-6 space-y-4">
              {/* Tabs Selector for the 3 Variations */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/80 pb-3.5">
                <div className="flex items-center gap-1.5 bg-[#09090B] p-1 rounded-lg border border-zinc-800">
                  {variations.map((v, idx) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setActiveTab(idx)}
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                        activeTab === idx
                          ? 'bg-zinc-100 text-zinc-950'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      <span>Opção 0{idx + 1}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono uppercase ${
                          activeTab === idx ? 'bg-zinc-950/15 text-zinc-950' : 'bg-zinc-900 text-zinc-500'
                        }`}
                      >
                        {v.badge}
                      </span>
                    </button>
                  ))}
                </div>

                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Salvo na Biblioteca IA
                </span>
              </div>

              {/* Active Variation Editor & Actions */}
              {variations[activeTab] && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-zinc-200">{variations[activeTab].label}</span>
                    <span className="text-[11px] text-zinc-500">Você pode editar o texto abaixo antes de enviar</span>
                  </div>

                  <textarea
                    rows={10}
                    value={variations[activeTab].text}
                    onChange={e => handleUpdateVariationText(activeTab, e.target.value)}
                    className="w-full rounded-xl bg-[#09090B] border border-zinc-800 p-4 text-sm text-zinc-100 leading-relaxed focus:outline-none focus:border-zinc-600 custom-scrollbar font-sans"
                  />

                  <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                    <Button
                      onClick={() => handleSendWhatsApp(variations[activeTab].text)}
                      className="w-full sm:flex-1 h-11 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs sm:text-sm"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {formData.phone.trim()
                        ? `Enviar no WhatsApp (${formData.phone})`
                        : 'Abrir e Enviar no WhatsApp'}
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => handleCopy(variations[activeTab].text, activeTab)}
                      className="w-full sm:w-auto h-11 px-5 text-xs sm:text-sm font-semibold"
                    >
                      {copiedIdx === activeTab ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-emerald-400" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copiar Texto
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* All 3 quick cards overview */}
              <div className="pt-4 border-t border-zinc-800/80">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 block mb-2.5">
                  Comparativo Rápido das 3 Variações
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  {variations.map((v, idx) => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setActiveTab(idx)}
                      className={`text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        activeTab === idx
                          ? 'bg-zinc-900 border-zinc-600'
                          : 'bg-[#09090B] border-zinc-800/80 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-zinc-200">Opção 0{idx + 1}</span>
                        <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                          {v.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 line-clamp-2">{v.text}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
