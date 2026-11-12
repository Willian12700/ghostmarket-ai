import React, { useState } from 'react'
import {
  Cpu,
  Target,
  Video,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  MessageSquare,
  DollarSign,
  Copy,
  Check,
  Flame,
  FileCode,
  Layers,
  ChevronRight,
  RefreshCw
} from 'lucide-react'

interface VideoProject {
  id?: string
  title: string
  hook: string
  format: 'Shorts' | 'Reels' | 'TikTok' | 'VSL'
  status: 'ideia' | 'roteirizado' | 'renderizado' | 'postado'
  bestTime: string
  targetPlatform: string
  estimatedViews?: string
  scriptSnippet: string
  audioVoice?: string
  remotionCode?: string
  createdAt?: any
}

interface LeadFollowUp {
  id?: string
  name: string
  channel: string
  status: 'quente' | 'morno' | 'fechado'
  lastContact: string
  suggestedReply: string
}

export const JarvisPanel: React.FC = () => {
  // Caixa e Meta dos R$ 800
  const [currentCash, setCurrentCash] = useState<number>(() => {
    const saved = localStorage.getItem('jarvis_current_cash')
    return saved ? Number(saved) : 111
  })
  const targetGoal = 800
  const progressPercent = Math.min(100, Math.round((currentCash / targetGoal) * 100))
  const remaining = Math.max(0, targetGoal - currentCash)

  // Abas do Jarvis
  const [activeTab, setActiveTab] = useState<'overview' | 'studio' | 'analytics' | 'whatsapp' | 'prompts'>('overview')

  // Gerador de Roteiro com IA para Vender o GhostMarket
  const [selectedHookStyle, setSelectedHookStyle] = useState('urgencia')
  const [selectedTopic, setSelectedTopic] = useState('como-criar-site-30s')
  const [generatedScript, setGeneratedScript] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedScript, setCopiedScript] = useState(false)

  // Status de IA e Engine
  const [systemLogs, setSystemLogs] = useState<string[]>([
    'JARVIS Engine v4.2 inicializado com sucesso.',
    'Sincronizado com GhostMarket AI core.',
    'Caixa inicial detectado: R$ 111,00.',
    'Meta ativa: R$ 800,00 (Desbloqueio Gemini Ultra / 4 Cargon).'
  ])

  // Projetos de Vídeo
  const [videoProjects] = useState<VideoProject[]>([
    {
      title: 'POV: Você demorou 1 ano e eu criei o site em 47s',
      hook: 'Se você ainda paga programador pra criar site, para tudo agora.',
      format: 'Shorts',
      status: 'roteirizado',
      bestTime: '12:30 (Pico Almoço)',
      targetPlatform: 'TikTok & Shorts',
      scriptSnippet: 'Mostra tela dividida: de um lado WordPress travando, do outro o GhostMarket gerando o site completo ao vivo.',
      remotionCode: `// Remotion Composition: GhostMarket_QuickDemo.tsx\nimport { AbsoluteFill, Sequence } from 'remotion';\n// Hook animado + voz ElevenLabs "Adam"`
    },
    {
      title: 'Como cobrei R$ 400 de uma hamburgueria ontem',
      hook: 'Fiz esse site em 3 minutos e o dono da hamburgueria me mandou um PIX.',
      format: 'Reels',
      status: 'ideia',
      bestTime: '18:45 (Volta do Trabalho)',
      targetPlatform: 'Instagram Reels',
      scriptSnippet: 'Abrindo o Scanner do GhostMarket, achando a hamburgueria sem cardápio digital e mandando o site pronto no WhatsApp.',
      remotionCode: `// Remotion Composition: LocalBusiness_Story.tsx`
    },
    {
      title: 'O SaaS que cria cardápio com Painel Admin pro dono',
      hook: 'Disseram que era impossível criar um SaaS completo pelo celular...',
      format: 'TikTok',
      status: 'postado',
      bestTime: '20:15 (Horário Nobre)',
      targetPlatform: 'TikTok',
      scriptSnippet: 'Demonstrando o botão do WhatsApp automático e o painel /painel/:slug do cliente.',
      remotionCode: `// Renderizado v1`
    }
  ])

  // Leads do WhatsApp
  const [leads] = useState<LeadFollowUp[]>([
    {
      name: 'Lucas (Hamburgueria Gourmet)',
      channel: 'WhatsApp X1',
      status: 'quente',
      lastContact: 'Há 15 min',
      suggestedReply: 'Fala Lucas! Vi que você curtiu o cardápio demo. Se fechar hoje, te libero o painel pro seu garçom atualizar preços na hora sem mensalidade cara.'
    },
    {
      name: 'Dr. Roberto (Clínica Odonto)',
      channel: 'WhatsApp X1',
      status: 'morno',
      lastContact: 'Hoje às 09:20',
      suggestedReply: 'Dr. Roberto, deixei o link da página de agendamento online ativo até às 18h pra você testar com seus pacientes.'
    }
  ])

  const handleUpdateCash = (newVal: number) => {
    setCurrentCash(newVal)
    localStorage.setItem('jarvis_current_cash', newVal.toString())
  }

  // Gerador de Roteiro Viral focado em VENDER O GHOSTMARKET
  const generateViralScript = () => {
    setIsGenerating(true)
    setTimeout(() => {
      let script = {
        title: 'Como estou faturando com o GhostMarket AI',
        hook: '',
        scenes: [] as { time: string; visual: string; narration: string; sound: string }[],
        cta: '',
        remotionSetup: ''
      }

      if (selectedTopic === 'como-criar-site-30s') {
        script.hook = '🚨 Se você não tem conhecimento nenhum de programação, assiste até o final.'
        script.scenes = [
          {
            time: '0:00 - 0:03',
            visual: 'Close na tela do PC rodando o GhostStudio em tela cheia com timer de 30 segundos.',
            narration: 'Eu duvido você encontrar uma ferramenta que cria um site profissional mais rápido que essa aqui.',
            sound: 'Whoosh rápido + Batida Trap subindo'
          },
          {
            time: '0:03 - 0:08',
            visual: 'Mostra escolhendo o nicho "Barbearia", mudando as cores em tempo real com 1 clique.',
            narration: 'Com 1 clique você escolhe o nicho, o sistema monta a página, coloca o botão pro WhatsApp e gera o link.',
            sound: 'Click suave + som de caixa registradora'
          },
          {
            time: '0:08 - 0:15',
            visual: 'Entra no Painel Admin do Cliente (/painel/slug) mostrando o cliente editando sozinho.',
            narration: 'E o melhor: o próprio dono do negócio ganha um painel pra trocar preços e fotos sem te encher o saco.',
            sound: 'Notificação do WhatsApp "Ping"'
          },
          {
            time: '0:15 - 0:20',
            visual: 'Mostra o link do GhostMarket na bio ou fixado na tela com seta brilhante.',
            narration: 'Quer acesso a essa ferramenta antes de todo mundo? Comenta "EU QUERO" que te mando o acesso agora na sua DM.',
            sound: 'Impacto suave + fade out'
          }
        ]
        script.cta = 'Comenta "GHOST" ou clica no link da minha bio pra testar a plataforma.'
      } else if (selectedTopic === 'faturei-sem-programar') {
        script.hook = '💸 Como fazer seus primeiros R$ 800 na internet usando inteligência artificial do jeito certo.'
        script.scenes = [
          {
            time: '0:00 - 0:03',
            visual: 'Print de comprovante PIX no celular + tela do GhostMarket com modelo de restaurante.',
            narration: 'Você não precisa passar 6 meses estudando código pra ter um produto que dá lucro.',
            sound: 'Alarme sutil + grave'
          },
          {
            time: '0:03 - 0:10',
            visual: 'Mostra o Scanner achando lojas no Google Maps sem site e o gerador de link demo em 1 minuto.',
            narration: 'Eu uso o GhostMarket pra escanear empresas locais que tão perdendo dinheiro sem site e entrego a solução pronta.',
            sound: 'Teclado rápido + zoom in'
          },
          {
            time: '0:10 - 0:18',
            visual: 'Demonstração de como mandar o link demo de 24h pro WhatsApp do cliente.',
            narration: 'O cliente vê o site pronto funcionando no nome dele e fecha na hora. Simples, rápido e no automático.',
            sound: 'Pop som de notificação'
          }
        ]
        script.cta = 'Link oficial do GhostMarket liberado no primeiro link da bio!'
      } else {
        script.hook = '🤖 "IA não vai tirar seu emprego, quem usa IA vai." Olha o que meu PC faz sozinho hoje:'
        script.scenes = [
          {
            time: '0:00 - 0:04',
            visual: 'Setup escuro futurista com o Painel do Jarvis e o GhostMarket rodando lado a lado.',
            narration: 'Transformei meu computador numa central de vendas com inteligência artificial operando 24 horas.',
            sound: 'Swoosh futurista'
          },
          {
            time: '0:04 - 0:12',
            visual: 'Transição rápida pelas ferramentas: Scanner de CNPJ, Criador de Sites e Roteiros.',
            narration: 'Ele encontra o cliente, gera a proposta comercial e cria o site em menos de 1 minuto.',
            sound: 'Grave cinematográfico'
          }
        ]
        script.cta = 'Salva esse vídeo e corre no link da bio pra conhecer o GhostMarket AI.'
      }

      setGeneratedScript(script)
      setIsGenerating(false)
    }, 600)
  }

  return (
    <div className="min-h-screen bg-[#07090E] text-zinc-100 p-4 lg:p-8 font-sans selection:bg-cyan-500/30 selection:text-cyan-300">
      {/* HEADER EXECUTIVO JARVIS */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-cyan-500/20 pb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-600 via-emerald-500 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/20">
                <div className="w-full h-full bg-[#0B0F17] rounded-2xl flex items-center justify-center">
                  <Cpu className="w-7 h-7 text-cyan-400 animate-pulse" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-[#07090E]"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-300 bg-clip-text text-transparent">
                  J.A.R.V.I.S. • Central Autônoma
                </h1>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  ONLINE • MÁQUINA DE DINHEIRO
                </span>
              </div>
              <p className="text-zinc-400 text-sm mt-0.5">
                Operando estratégias para vender o GhostMarket AI & bater o objetivo do Gemini Ultra.
              </p>
            </div>
          </div>

          {/* TERMÔMETRO DA META (R$ 111 -> R$ 800) */}
          <div className="w-full md:w-auto min-w-[280px] bg-gradient-to-br from-[#0F1420] to-[#0A0D14] border border-cyan-500/30 rounded-xl p-3.5 shadow-xl shadow-cyan-950/40">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-zinc-400 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                META GEMINI ULTRA
              </span>
              <span className="text-cyan-300 font-bold">
                R$ {currentCash.toFixed(2)} / R$ {targetGoal.toFixed(2)}
              </span>
            </div>

            {/* Barra de Progresso */}
            <div className="w-full h-2.5 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 p-[1px]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-500 shadow-sm shadow-cyan-400/50"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] mt-2 text-zinc-400">
              <span>{progressPercent}% alcançado</span>
              <span className="text-emerald-400 font-semibold font-mono">
                Faltam R$ {remaining.toFixed(2)}
              </span>
            </div>

            {/* Ajuste Rápido de Saldo */}
            <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-zinc-800/80">
              <span className="text-[10px] text-zinc-500 mr-1">Atualizar Caixa:</span>
              <button
                onClick={() => handleUpdateCash(currentCash + 50)}
                className="text-[10px] font-mono bg-zinc-800 hover:bg-emerald-950/60 hover:text-emerald-400 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 transition-all"
              >
                +R$ 50
              </button>
              <button
                onClick={() => handleUpdateCash(currentCash + 100)}
                className="text-[10px] font-mono bg-zinc-800 hover:bg-emerald-950/60 hover:text-emerald-400 text-zinc-300 px-2 py-0.5 rounded border border-zinc-700 transition-all"
              >
                +R$ 100
              </button>
              <button
                onClick={() => {
                  const val = prompt('Digite o saldo atual do seu caixa:', currentCash.toString())
                  if (val && !isNaN(Number(val))) handleUpdateCash(Number(val))
                }}
                className="text-[10px] font-mono bg-cyan-950/50 hover:bg-cyan-900/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-700/50 ml-auto transition-all"
              >
                Editar
              </button>
            </div>
          </div>
        </div>

        {/* NAVEGAÇÃO DE ABAS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-zinc-800 mt-6 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            Visão Geral & Métricas
          </button>

          <button
            onClick={() => setActiveTab('studio')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'studio'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Video className="w-4 h-4" />
            Fábrica de Vídeos Virais
            <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.2 rounded font-mono">
              HOT
            </span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'analytics'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Horários & Rendimento
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'whatsapp'
                ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Central WhatsApp X1
            <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
              2 Novos
            </span>
          </button>
        </div>
      </div>

      {/* CONTEÚDO PRINCIPAL DAS ABAS */}
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ABA 1: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CARDS DE IMPACTO RÁPIDO */}
            <div className="lg:col-span-2 space-y-6">
              {/* PLANO DE AÇÃO PARA BATER OS R$ 800 */}
              <div className="bg-[#0B0F17] border border-cyan-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-bold text-white">Estratégia de Alavancagem Rápida</h2>
                  </div>
                  <span className="text-xs font-mono text-zinc-400">Objetivo: R$ 800</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span>Etapa 1</span>
                      <span className="text-emerald-400 font-bold font-mono">3 Vendas</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">Acesso Vitalício Ghost</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Se você vender 3 acessos a R$ 230 cada (ou 4 a R$ 170), você passa dos R$ 800 imediatamente.
                    </p>
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span>Etapa 2</span>
                      <span className="text-cyan-400 font-bold font-mono">Vídeos Orgânicos</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">3 Shorts por Dia</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Postar com os ganchos gerados pela IA no TikTok, Reels e Shorts direcionando pro link na bio.
                    </p>
                  </div>

                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 hover:border-cyan-500/40 transition-all">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span>Etapa 3</span>
                      <span className="text-indigo-400 font-bold font-mono">Fechamento X1</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-1">Conversão no WhatsApp</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Quem comentar "QUERO" nos vídeos recebe o link direto de pagamento com a copy do Jarvis.
                    </p>
                  </div>
                </div>

                <div className="mt-5 p-3.5 bg-cyan-950/30 border border-cyan-800/40 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-200">
                      <strong>Dica Jarvis:</strong> 1 vídeo viral de 10k views gera em média de 15 a 40 cliques no link da sua bio.
                    </span>
                  </div>
                  <button
                    onClick={() => setActiveTab('studio')}
                    className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                  >
                    Criar Vídeo Agora <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* LISTA DE VÍDEOS EM PRODUÇÃO */}
              <div className="bg-[#0B0F17] border border-zinc-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Video className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-bold text-white">Pipeline de Vídeos para Divulgação</h2>
                  </div>
                  <button
                    onClick={() => setActiveTab('studio')}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1"
                  >
                    + Novo Vídeo
                  </button>
                </div>

                <div className="space-y-3">
                  {videoProjects.map((vid, idx) => (
                    <div
                      key={idx}
                      className="bg-zinc-900/40 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                            {vid.format}
                          </span>
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                              vid.status === 'postado'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : vid.status === 'renderizado'
                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            }`}
                          >
                            {vid.status.toUpperCase()}
                          </span>
                          <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-cyan-400" /> {vid.bestTime}
                          </span>
                        </div>
                        <h4 className="font-semibold text-white text-sm">{vid.title}</h4>
                        <p className="text-xs text-zinc-400 line-clamp-1 italic">"{vid.hook}"</p>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-center">
                        <button
                          onClick={() => {
                            setSelectedTopic('como-criar-site-30s')
                            generateViralScript()
                            setActiveTab('studio')
                          }}
                          className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-1.5 transition-all"
                        >
                          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                          Roteiro & Código
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* COLUNA LATERAL: LOGS DO JARVIS & STATUS */}
            <div className="space-y-6">
              {/* STATUS DO SISTEMA */}
              <div className="bg-[#0B0F17] border border-cyan-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <h3 className="font-bold text-white text-sm">Status dos Motores de IA</h3>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800">
                    <span className="text-zinc-400">Gemini Local (Assistente)</span>
                    <span className="text-emerald-400 font-bold">ATIVO</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800">
                    <span className="text-zinc-400">GhostMarket SaaS (Vendas)</span>
                    <span className="text-emerald-400 font-bold">NO AR (Vercel)</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800">
                    <span className="text-zinc-400">Motor de Vídeo (Remotion)</span>
                    <span className="text-cyan-400 font-bold">PRONTO</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/70 border border-zinc-800">
                    <span className="text-zinc-400">Voz Neural (ElevenLabs/TTS)</span>
                    <span className="text-amber-400 font-bold">CONFIGURADO</span>
                  </div>
                </div>
              </div>

              {/* TERMINAL DO JARVIS */}
              <div className="bg-[#05070B] border border-zinc-800 rounded-2xl p-5 font-mono text-xs">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-zinc-800 text-zinc-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500/80" />
                    <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
                    <span className="w-2 h-2 rounded-full bg-green-500/80" />
                    <span className="text-[11px] text-zinc-400 font-bold ml-1">JARVIS Terminal Log</span>
                  </div>
                  <span className="text-[10px] text-zinc-500">Live</span>
                </div>

                <div className="space-y-2 text-zinc-400 max-h-48 overflow-y-auto pr-1">
                  {systemLogs.map((log, i) => (
                    <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                      <span className="text-cyan-500">{'>'}</span>
                      <span className={i === systemLogs.length - 1 ? 'text-cyan-300' : 'text-zinc-400'}>
                        {log}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 pt-3 border-t border-zinc-850 flex items-center gap-2 text-zinc-500">
                  <span className="text-emerald-400">$</span>
                  <input
                    type="text"
                    placeholder="Comando para o Jarvis..."
                    className="bg-transparent text-zinc-200 outline-none w-full text-xs"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                        setSystemLogs(prev => [...prev, e.currentTarget.value])
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABA 2: FÁBRICA DE VÍDEOS */}
        {activeTab === 'studio' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* CONFIGURADOR DO VÍDEO */}
            <div className="lg:col-span-5 bg-[#0B0F17] border border-cyan-500/20 rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white text-base">Gerador de Vídeos de Alta Conversão</h3>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                A IA monta o roteiro com gancho psicológico, indica as cenas que você deve filmar na tela do GhostMarket e entrega o código do vídeo.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Tema Central do Vídeo:
                  </label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 outline-none focus:border-cyan-500"
                  >
                    <option value="como-criar-site-30s">Como criar um site completo em 30 segundos (Demo Visual)</option>
                    <option value="faturei-sem-programar">Como faturar R$ 800 prestando serviço com o GhostMarket</option>
                    <option value="meu-pc-virou-empresa">Transformei meu computador numa central de vendas com IA</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-300 block mb-1.5">
                    Estilo de Gancho (Primeiros 3s):
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'urgencia', label: 'Urgência' },
                      { id: 'curiosidade', label: 'Curiosidade' },
                      { id: 'quebra-padrao', label: 'Quebra Padrão' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setSelectedHookStyle(st.id)}
                        className={`text-xs py-2 px-2.5 rounded-lg border text-center transition-all ${
                          selectedHookStyle === st.id
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={generateViralScript}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-black font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Compilando Roteiro com IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-black" /> Gerar Roteiro Viral & Cenas
                    </>
                  )}
                </button>
              </div>

              {/* DICA DE PRODUÇÃO */}
              <div className="p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-2 text-xs">
                <span className="text-amber-400 font-bold flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" /> Como gravar em 3 minutos:
                </span>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  1. Abra o OBS ou Windows Game Bar (Win+G).<br />
                  2. Grave a tela abrindo o GhostStudio e clicando em "Publicar".<br />
                  3. Jogue o áudio gerado com a voz neural por cima.<br />
                  4. Poste no TikTok / Reels com as tags recomendadas!
                </p>
              </div>
            </div>

            {/* PREVIEW DO ROTEIRO GERADO & REMOTION CODE */}
            <div className="lg:col-span-7 bg-[#0B0F17] border border-zinc-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">Roteiro Estruturado do Vídeo</h3>
                </div>

                {generatedScript && (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(generatedScript, null, 2))
                      setCopiedScript(true)
                      setTimeout(() => setCopiedScript(false), 2000)
                    }}
                    className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg border border-zinc-700 flex items-center gap-1 transition-all"
                  >
                    {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedScript ? 'Copiado!' : 'Copiar Roteiro'}
                  </button>
                )}
              </div>

              {!generatedScript ? (
                <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-xl p-6 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Video className="w-6 h-6" />
                  </div>
                  <p className="text-zinc-400 text-xs max-w-sm">
                    Selecione um tema ao lado e clique em <strong>"Gerar Roteiro Viral"</strong> para a IA montar as cenas cronometradas para você gravar.
                  </p>
                  <button
                    onClick={generateViralScript}
                    className="text-xs bg-cyan-950/60 text-cyan-300 border border-cyan-700/60 px-4 py-2 rounded-lg hover:bg-cyan-900/80 transition-all font-mono"
                  >
                    Carregar Exemplo
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* GANCHO */}
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-amber-400 font-bold block mb-1">
                      GANCHO INICIAL (0s a 3s) • 80% DA RETENÇÃO
                    </span>
                    <p className="text-sm font-semibold text-white">{generatedScript.hook}</p>
                  </div>

                  {/* CENAS CRONOMETRADAS */}
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {generatedScript.scenes.map((scene: any, idx: number) => (
                      <div key={idx} className="p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-cyan-400 font-bold">Cena {idx + 1} ({scene.time})</span>
                          <span className="text-zinc-500">{scene.sound}</span>
                        </div>
                        <div className="text-xs text-zinc-300">
                          <strong className="text-zinc-400">Na Tela:</strong> {scene.visual}
                        </div>
                        <div className="text-xs text-white bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-850">
                          <strong className="text-emerald-400">Locução (Voz):</strong> "{scene.narration}"
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                      CHAMADA PRA AÇÃO (CTA FINAL)
                    </span>
                    <p className="text-xs font-semibold text-zinc-200">{generatedScript.cta}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ABA 3: HORÁRIOS & RENDIMENTO */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-[#0B0F17] border border-zinc-800 rounded-2xl p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-base">Matriz de Melhores Horários para Postar</h3>
                </div>
                <span className="text-xs font-mono text-zinc-400">Algoritmo 2026</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">TikTok</span>
                    <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded font-mono">Alta Entrega</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-cyan-300">12:30 & 19:15</div>
                  <p className="text-[11px] text-zinc-400">
                    Pico de profissionais e jovens pesquisando renda extra e ferramentas de IA.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">Instagram Reels</span>
                    <span className="text-[10px] bg-pink-500/10 text-pink-400 px-1.5 py-0.5 rounded font-mono">Conversão Alta</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-pink-300">18:45 & 21:00</div>
                  <p className="text-[11px] text-zinc-400">
                    Excelente para puxar leads diretamente para a DM e fechar no WhatsApp.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">YouTube Shorts</span>
                    <span className="text-[10px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded font-mono">Permanência Longa</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-red-300">11:00 & 16:30</div>
                  <p className="text-[11px] text-zinc-400">
                    Vídeos tutoriais do GhostMarket continuam recebendo views por meses no YouTube.
                  </p>
                </div>
              </div>

              {/* FORMATO COM MAIOR RETENÇÃO */}
              <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider text-zinc-300">
                  Qual formato gera mais vendas do GhostMarket?
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-850">
                    <span className="text-zinc-300">1. Demonstração Visual Rápida ("Criando site em 30s")</span>
                    <span className="text-emerald-400 font-mono font-bold">4.8x Mais Conversão</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-850">
                    <span className="text-zinc-300">2. Estudo de Caso ("Como fechei R$ 400 em 1 dia")</span>
                    <span className="text-cyan-400 font-mono font-bold">3.2x Mais Conversão</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-950/60 border border-zinc-850">
                    <span className="text-zinc-300">3. Comparação ("WordPress vs GhostMarket AI")</span>
                    <span className="text-amber-400 font-mono font-bold">2.5x Mais Conversão</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CALCULADORA DE METAS */}
            <div className="bg-[#0B0F17] border border-cyan-500/20 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Calculadora de Vendas</h3>
              </div>

              <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <span className="text-xs text-zinc-400">Com o preço sugerido do GhostMarket:</span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-300">1 Venda a R$ 197:</span>
                    <span className="text-emerald-400 font-bold">R$ 197,00</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-300">2 Vendas:</span>
                    <span className="text-emerald-400 font-bold">R$ 394,00</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-800 pb-1.5">
                    <span className="text-zinc-300">4 Vendas (Bate a meta):</span>
                    <span className="text-cyan-300 font-bold">R$ 788,00 (+ R$ 111 = R$ 899!)</span>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-400 pt-1">
                  Ou seja, você só precisa de <strong>4 pessoas</strong> comprando o seu SaaS para você desbloquear o plano ultra.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ABA 4: WHATSAPP X1 */}
        {activeTab === 'whatsapp' && (
          <div className="bg-[#0B0F17] border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-white text-base">Central de Fechamento WhatsApp X1</h3>
              </div>
              <span className="text-xs text-zinc-400">Respostas Estratégicas Pré-formatadas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {leads.map((lead, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-white text-sm">{lead.name}</h4>
                      <span className="text-[10px] text-zinc-400">{lead.lastContact} • {lead.channel}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                        lead.status === 'quente'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {lead.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="p-3 bg-zinc-950/60 border border-zinc-850 rounded-lg text-xs text-zinc-300 space-y-1.5">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold block">
                      RESPOSTA RECOMENDADA PELO JARVIS:
                    </span>
                    <p className="italic">"{lead.suggestedReply}"</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(lead.suggestedReply)
                        alert('Resposta copiada! Cole no WhatsApp.')
                      }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar Resposta
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default JarvisPanel
