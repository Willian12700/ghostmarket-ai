import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Rocket,
  ShieldCheck,
  Zap,
  Wrench,
  ArrowUpRight,
  Megaphone,
  CheckCircle2
} from 'lucide-react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'

export interface PlatformUpdateItem {
  id: string
  version: string
  date: string
  category: 'feature' | 'improvement' | 'security' | 'fix'
  categoryLabel: string
  title: string
  summary: string
  highlights: string[]
  actionRoute?: string
  actionLabel?: string
  isBuiltIn?: boolean
  createdAtMs?: number
}

export const MEGA_UPDATE_WHATSAPP_TEXT = `🚀🔥 *MEGA ATUALIZAÇÃO 3.0 NO AR — GHOSTMARKET AI!* 🔥🚀

Fala tropa! Acabamos de subir a *MAIOR ATUALIZAÇÃO DA HISTÓRIA* da nossa plataforma! Fizemos uma reconstrução pesada focada em fazer vocês fecharem contratos de R$ 1.000 a R$ 3.500 ainda mais rápido e com entrega profissional nível agência de elite.

Confira tudo que acabou de entrar no ar:

━━━━━━━━━━━━━━━━━━━━━━
🎨 *1. NOVO GHOSTSTUDIO (+55 MODELOS PRONTOS EM TEMPO REAL & SITES ILIMITADOS)*
• Mais de *55 templates B2B de alta conversão* divididos por nicho (Hamburgueria, Pizzaria, Barbearia, Clínica Odontológica, Estética, Advocacia, Imobiliária, Academia, Oficina, Pet Shop, Energia Solar e muito mais!).
• *Editor Visual Ao Vivo:* Troque nome da empresa, telefone/WhatsApp, endereço, textos, imagens, produtos/preços e *paletas de cores inteiras em 1 clique* vendo tudo mudar na hora!
• *Sites Ilimitados:* Crie e publique quantos sites quiser com proteção inteligente de domínio único!

🔐 *2. PAINEL ADMIN EXCLUSIVO PARA O SEU CLIENTE (GRANDE DIFERENCIAL DE VENDA!)*
• Agora os sites que você cria contam com um *Painel Administrativo próprio para o dono do estabelecimento* (\`/painel/id-do-site\`)!
• O próprio dono da Hamburgueria, Barbearia ou Clínica pode logar pelo celular dele e:
  ✅ Alterar preços e itens do cardápio/catálogo
  ✅ Marcar produtos como *"⛔ Esgotado Hoje"* em 1 clique
  ✅ Mudar o status da loja ao vivo (*🟢 Aberto Agora*, *⚡ Horário de Pico* ou *🔴 Fechado*)
  ✅ Ativar um *Banner Promocional* no topo do site (ex: Terça em Dobro / Cupom do Dia)
• *Segurança Blindada (SHA-256 + Salt):* Você cria o login e a senha do seu cliente direto no GhostStudio. A senha é criptografada e impossível de ser descoberta pelo Inspecionar Elemento (F12).
• *Kit de Entrega WhatsApp em 1 Clique:* Copie a mensagem pronta com o Link do Site + Link do Painel Admin + Login e Senha para enviar ao cliente assim que ele pagar!

🏆 *3. SISTEMA DE PATENTES, PLACAS & RANKING GLOBAL*
• Suba de nível conforme fecha contratos no CRM:
  🥉 *Starter* (R$ 0+)
  🥈 *Closer Pro* (R$ 5.000+)
  🥇 *Agência Elite* (R$ 10.000+)
  💎 *10K Club* (R$ 25.000+)
  👑 *Lenda 50K* (R$ 50.000+)
• Sua patente aparece ao vivo no topo da plataforma com barra de progresso para a próxima placa e filtro de *Ranking Mensal vs. Geral*!

🤖 *4. NOVO COPILOTO DE FECHAMENTO X1 (DESTRUIDOR DE OBJEÇÕES)*
• O botão flutuante no canto da tela agora é o seu braço direito de vendas:
  ⚡ *Destruidor de Objeções X1:* Cliente falou *"Tá caro"*, *"Vou falar com meu sócio"*, *"Já tenho Instagram"* ou *"Me manda uma proposta"*? Clique na objeção e copie a resposta matadora na hora!
  💰 *Tabela de Preços Sugeridos por Nicho:* Veja exatamente quanto cobrar de Setup + Mensalidade em cada nicho.

🏢 *5. DOSSIÊ CNPJ CONECTADO AO GHOSTSTUDIO E PROPOSTA PDF*
• Consultou um CNPJ no Dossiê? Agora com *1 clique* você já abre o GhostStudio com os dados da empresa preenchidos OU gera a *Proposta Comercial / Contrato PDF* já em nome do sócio-administrador!

📲 *6. CORREÇÃO TOTAL DO REDIRECIONAMENTO DE WHATSAPP & ROTAS*
• Correção definitiva do bloqueio \`api.whatsapp.com\` nos sites criados e formatação automática do DDI \`+55\` para números brasileiros.
• Nova *Landing Page Oficial* com demonstração interativa ao vivo do Site + Painel Admin do Lojista.
• Nova *Central de Novidades (\`/atualizacoes\`)* dentro do SaaS para você acompanhar todos os lançamentos em primeira mão!
━━━━━━━━━━━━━━━━━━━━━━

👉 *Acesse agora mesmo e teste todas as novidades:*
https://ghostmarket-ai.vercel.app/atualizacoes

Bora pra cima dominar o mercado local! 🚀🔥`

export const BUILT_IN_UPDATES: PlatformUpdateItem[] = [
  {
    id: 'v3-0-mega-studio',
    version: 'v3.0.0 — MEGA UPDATE',
    date: 'Hoje',
    category: 'feature',
    categoryLabel: '🚀 Nova Função Principal',
    title: 'GhostStudio Visual em Tempo Real com +55 Modelos Prontos & Sites Ilimitados',
    summary:
      'Transformamos a criação de sites em uma máquina visual instantânea. Escolha entre mais de 55 modelos validados, personalize tudo em tempo real e publique quantos sites quiser.',
    highlights: [
      '+55 Templates B2B divididos em Gastronomia, Beleza & Estética, Saúde, Jurídico & Finanças, Imóveis, Automotivo, Fitness e Serviços.',
      'Editor Visual em Tempo Real: altere Nome, Slogan, Telefone/WhatsApp, Endereço, Textos, Fotos e Itens/Preços vendo o resultado instantaneamente.',
      'Hospedagem Ilimitada liberada com proteção inteligente contra domínios duplicados.',
      'Seletor de Paletas de Cores em 1 clique para deixar o site com a identidade visual exata do cliente em segundos.'
    ],
    actionRoute: '/builder',
    actionLabel: 'Abrir GhostStudio (+55 Modelos)',
    isBuiltIn: true,
    createdAtMs: 1794106000005
  },
  {
    id: 'v3-0-client-admin',
    version: 'v3.0.0 — MEGA UPDATE',
    date: 'Hoje',
    category: 'security',
    categoryLabel: '🔐 Diferencial de Venda & Segurança',
    title: 'Painel Admin Exclusivo para o Dono do Estabelecimento (Blindado com SHA-256)',
    summary:
      'Agora você não vende apenas um site estático: você entrega um sistema completo onde o seu cliente (Hamburgueria, Barbearia, Clínica, Loja) tem login e senha próprios para gerenciar o negócio pelo celular!',
    highlights: [
      'Rota exclusiva /painel/:siteId para o dono do estabelecimento acessar pelo celular ou computador.',
      'O lojista pode alterar preços do cardápio/catálogo, editar descrições e marcar itens como "⛔ Esgotado Hoje" em tempo real.',
      'Controle de Status ao vivo no topo do site ("🟢 Aberto Agora", "⚡ Horário de Pico", "🔴 Fechado") e Banner Promocional do Dia.',
      'Criptografia Web Crypto SHA-256 com Salt de 16 bytes: impossível descobrir a senha inspecionando a página com F12.',
      'Botão "Kit de Entrega WhatsApp" em Meus Sites e no GhostStudio para copiar Link do Site + Link do Painel + Login e Senha em 1 clique.'
    ],
    actionRoute: '/sites',
    actionLabel: 'Gerenciar Sites & Painel do Cliente',
    isBuiltIn: true,
    createdAtMs: 1794106000004
  },
  {
    id: 'v3-0-ranks-copilot',
    version: 'v3.0.0 — MEGA UPDATE',
    date: 'Hoje',
    category: 'feature',
    categoryLabel: '🏆 Gamificação & Vendas X1',
    title: 'Sistema de Patentes (Placas de Faturamento) & Copiloto de Fechamento X1',
    summary:
      'Novo sistema de evolução para membros da comunidade e assistente flutuante focado em quebrar objeções no WhatsApp em segundos.',
    highlights: [
      '5 Patentes Oficiais baseadas nos seus contratos fechados: Starter (🥉), Closer Pro (🥈 R$ 5k+), Agência Elite (🥇 R$ 10k+), 10K Club (💎 R$ 25k+) e Lenda 50K (👑 R$ 50k+).',
      'Placa da sua patente visível no topo do sistema + Barra de Progresso no Ranking Global com filtro Mensal vs. All-Time.',
      'Novo Copiloto de Fechamento X1 no botão flutuante: clique na objeção que o cliente mandou ("Tá caro", "Vou ver com meu sócio", "Já tenho Instagram") e copie o script matador em 1 clique.',
      'Guia rápido de Precificação por Nicho integrado ao Copiloto (quanto cobrar de Setup + Mensalidade).'
    ],
    actionRoute: '/ranking',
    actionLabel: 'Ver Patentes & Ranking Global',
    isBuiltIn: true,
    createdAtMs: 1794106000003
  },
  {
    id: 'v3-0-cnpj-workflow',
    version: 'v3.0.0 — MEGA UPDATE',
    date: 'Hoje',
    category: 'improvement',
    categoryLabel: '⚡ Produtividade & Automação',
    title: 'Fluxo 1-Clique no Dossiê CNPJ + Novo Onboarding Rápido em 3 Passos',
    summary:
      'Conectamos a prospecção à entrega para você ir do CNPJ consultado até a proposta PDF e o site pronto em menos de 3 minutos.',
    highlights: [
      'No Dossiê CNPJ, clique em "Criar Site p/ Esta Empresa" para abrir o GhostStudio já preenchido com Nome, WhatsApp e Cidade do CNPJ.',
      'Clique em "Gerar Proposta / Contrato PDF" no Dossiê CNPJ para preencher automaticamente o documento com razão social, CNPJ e nome do sócio.',
      'Novo modal de Boas-Vindas enxuto em 3 passos práticos (Encontrar Cliente → Gerar Site + Painel → Fechar no WhatsApp).'
    ],
    actionRoute: '/cnpj',
    actionLabel: 'Testar Dossiê CNPJ Integrado',
    isBuiltIn: true,
    createdAtMs: 1794106000002
  },
  {
    id: 'v3-0-whatsapp-routes-fix',
    version: 'v3.0.0 — MEGA UPDATE',
    date: 'Hoje',
    category: 'fix',
    categoryLabel: '🛠️ Correção Crítica & Rotas',
    title: 'Correção Definitiva do Redirecionamento WhatsApp & Unificação de Rotas',
    summary:
      'Resolvido o erro ERR_BLOCKED_BY_RESPONSE ao clicar no botão de WhatsApp dentro dos sites e padronizadas todas as rotas do SaaS.',
    highlights: [
      'Adicionada permissão de navegação externa segura e formatação automática do código do país (+55) para celulares e fixos brasileiros.',
      'Sincronização automática entre o GhostStudio, Meus Sites Hospedados, Visualizador Público (/s/:siteId), Painel do Lojista (/painel/:siteId) e Relatório do Cliente (/relatorio/:siteId).',
      'Nova Landing Page de alta conversão com prévia interativa alternando entre o Site do Cliente e o Painel Admin do Lojista.'
    ],
    actionRoute: '/builder',
    actionLabel: 'Testar no GhostStudio',
    isBuiltIn: true,
    createdAtMs: 1794106000001
  }
]

export const CATEGORY_CONFIG = {
  feature: {
    label: '🚀 Nova Função',
    badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    icon: Rocket
  },
  improvement: {
    label: '⚡ Melhoria',
    badgeClass: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
    icon: Zap
  },
  security: {
    label: '🔐 Segurança & Painel',
    badgeClass: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    icon: ShieldCheck
  },
  fix: {
    label: '🛠️ Correção',
    badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    icon: Wrench
  }
}

export const Updates = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const isAdmin =
    user?.email === 'willrandrier@gmail.com' ||
    user?.email === 'souza.abencoado4@gmail.com' ||
    (user as any)?.role === 'admin'

  const [customUpdates, setCustomUpdates] = useState<PlatformUpdateItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'platform_updates'),
      snap => {
        const list: PlatformUpdateItem[] = []
        snap.forEach(d => {
          const data = d.data()
          list.push({
            id: d.id,
            version: data.version || 'v3.0+',
            date: data.date || 'Recente',
            category: data.category || 'feature',
            categoryLabel:
              data.categoryLabel ||
              CATEGORY_CONFIG[(data.category as keyof typeof CATEGORY_CONFIG) || 'feature']?.label ||
              '🚀 Atualização',
            title: data.title || '',
            summary: data.summary || '',
            highlights: Array.isArray(data.highlights) ? data.highlights : [],
            actionRoute: data.actionRoute || '/dashboard',
            actionLabel: data.actionLabel || 'Ver na Plataforma',
            isBuiltIn: false,
            createdAtMs: data.createdAtMs || Date.now()
          })
        })
        list.sort((a, b) => (b.createdAtMs || 0) - (a.createdAtMs || 0))
        setCustomUpdates(list)
      },
      err => {
        console.error('Erro ao carregar atualizações:', err)
      }
    )

    return () => unsub()
  }, [])

  const allUpdates = [...customUpdates, ...BUILT_IN_UPDATES]
  const filteredUpdates =
    selectedCategory === 'all'
      ? allUpdates
      : allUpdates.filter(item => item.category === selectedCategory)

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Member-Facing Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#0c1512] via-[#09090B] to-[#111118] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MURAL OFICIAL DE LANÇAMENTOS • V3.0 NO AR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Novidades & Atualizações da Plataforma
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Confira todas as novas ferramentas, recursos e melhorias liberadas no GhostMarket AI.
              Clique em qualquer novidade abaixo para abrir e testar na hora.
            </p>
          </div>

          {isAdmin && (
            <div className="shrink-0">
              <button
                onClick={() => navigate('/admin/atualizacoes')}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
              >
                <Megaphone className="w-4 h-4" />
                <span>Abrir Disparador Admin (/admin/atualizacoes)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Todas as Novidades' },
            { id: 'feature', label: '🚀 Novas Funções' },
            { id: 'security', label: '🔐 Painel do Cliente & Segurança' },
            { id: 'improvement', label: '⚡ Melhorias' },
            { id: 'fix', label: '🛠️ Correções & Rotas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                selectedCategory === tab.id
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                  : 'bg-zinc-900/70 border-zinc-800 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-zinc-500 font-mono">
          {filteredUpdates.length} atualizações disponíveis
        </span>
      </div>

      {/* Clean Member Updates Feed */}
      <div className="space-y-4">
        {filteredUpdates.map(item => {
          const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.feature
          const IconComponent = catConfig.icon

          return (
            <div
              key={item.id}
              className="rounded-2xl border border-zinc-800/90 bg-[#0D0D11] hover:border-zinc-700/80 transition-all p-5 sm:p-6 space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-700 text-xs font-mono font-bold text-white">
                    {item.version}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold ${catConfig.badgeClass}`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{item.categoryLabel || catConfig.label}</span>
                  </span>
                  <span className="text-xs text-zinc-500 font-mono">• {item.date}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{item.summary}</p>
              </div>

              {item.highlights && item.highlights.length > 0 && (
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                    O que entrou no ar:
                  </div>
                  <ul className="space-y-2">
                    {item.highlights.map((bullet, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {item.actionRoute && (
                <div className="pt-1 flex items-center justify-end">
                  <button
                    onClick={() => navigate(item.actionRoute!)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-emerald-500/15 border border-zinc-800 hover:border-emerald-500/40 text-xs font-semibold text-zinc-200 hover:text-emerald-300 transition-all cursor-pointer"
                  >
                    <span>{item.actionLabel || 'Testar Ferramenta Agora'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
