import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Bell,
  Send,
  Copy,
  Check,
  Rocket,
  ShieldCheck,
  Zap,
  Wrench,
  ArrowUpRight,
  Plus,
  Trash2,
  Megaphone,
  Loader2,
  CheckCircle2
} from 'lucide-react'
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
  writeBatch,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'

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
🎨 *1. NOVO GHOSTSTUDIO (+55 MODELOS PRONTOS EM TEMPO REAL)*
• Mais de *55 templates B2B de alta conversão* divididos por nicho (Hamburgueria, Pizzaria, Barbearia, Clínica Odontológica, Estética, Advocacia, Imobiliária, Academia, Oficina, Pet Shop, Energia Solar e muito mais!).
• *Editor Visual Ao Vivo:* Troque nome da empresa, telefone/WhatsApp, endereço, textos, imagens, produtos/preços e *paletas de cores inteiras em 1 clique* vendo tudo mudar na hora!
• *Modelos & Prompts Unificados:* Agora a aba de Modelos já abre direto a galeria completa para você escolher e editar na hora.

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
• Nova *Central de Atualizações (\`/atualizacoes\`)* dentro do SaaS para você acompanhar todas as novidades em primeira mão!
━━━━━━━━━━━━━━━━━━━━━━

👉 *Acesse agora mesmo e teste todas as novidades:*
https://ghostmarket-ai.vercel.app/atualizacoes

Bora pra cima dominar o mercado local! 🚀🔥`

const BUILT_IN_UPDATES: PlatformUpdateItem[] = [
  {
    id: 'v3-0-mega-studio',
    version: 'v3.0.0 — MEGA UPDATE',
    date: 'Hoje',
    category: 'feature',
    categoryLabel: '🚀 Nova Função Principal',
    title: 'GhostStudio Visual em Tempo Real com +55 Modelos Prontos por Nicho',
    summary:
      'Transformamos a criação de sites em uma máquina visual instantânea. Escolha entre mais de 55 modelos validados e personalize tudo em tempo real sem precisar tocar em código.',
    highlights: [
      '+55 Templates B2B divididos em Gastronomia, Beleza & Estética, Saúde, Jurídico & Finanças, Imóveis, Automotivo, Fitness e Serviços.',
      'Editor Visual em Tempo Real: altere Nome, Slogan, Telefone/WhatsApp, Endereço, Textos, Fotos e Itens/Preços vendo o resultado instantaneamente.',
      'Seletor de Paletas de Cores em 1 clique para deixar o site com a identidade visual exata do cliente em segundos.',
      'Aba Modelos & Prompts unificada diretamente com a galeria interativa de 55+ modelos.'
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

const CATEGORY_CONFIG = {
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
  const { addToast } = useToastStore()

  const isAdmin =
    user?.email === 'willrandrier@gmail.com' ||
    user?.email === 'souza.abencoado4@gmail.com' ||
    (user as any)?.role === 'admin'

  const [customUpdates, setCustomUpdates] = useState<PlatformUpdateItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedMegaList, setCopiedMegaList] = useState(false)

  // Admin Composer State
  const [showAdminModal, setShowAdminModal] = useState(false)
  const [version, setVersion] = useState('v3.1.0')
  const [category, setCategory] = useState<'feature' | 'improvement' | 'security' | 'fix'>('feature')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [highlightsText, setHighlightsText] = useState('')
  const [actionRoute, setActionRoute] = useState('/builder')
  const [actionLabel, setActionLabel] = useState('Testar Novidade Agora')
  const [sendNotificationToAll, setSendNotificationToAll] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isBroadcastingId, setIsBroadcastingId] = useState<string | null>(null)

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

  // Helper to collect all unique user emails/UIDs to receive update notifications
  const fetchAllRecipientIds = async (): Promise<string[]> => {
    const recipients = new Set<string>()
    try {
      const allowedSnap = await getDocs(collection(db, 'allowed_users'))
      allowedSnap.forEach(d => {
        if (d.id && d.id.includes('@')) recipients.add(d.id.toLowerCase().trim())
        const email = d.data()?.email
        if (email && typeof email === 'string') recipients.add(email.toLowerCase().trim())
      })
    } catch (e) {
      console.error('Erro ao buscar allowed_users:', e)
    }

    try {
      const usersSnap = await getDocs(collection(db, 'users'))
      usersSnap.forEach(d => {
        const data = d.data()
        if (data?.email && typeof data.email === 'string') {
          recipients.add(data.email.toLowerCase().trim())
        } else if (d.id) {
          recipients.add(d.id)
        }
      })
    } catch (e) {
      console.error('Erro ao buscar users:', e)
    }

    if (user?.email) recipients.add(user.email.toLowerCase().trim())
    else if (user?.uid) recipients.add(user.uid)

    return Array.from(recipients).filter(Boolean)
  }

  const broadcastUpdateNotification = async (
    notifTitle: string,
    notifText: string,
    route: string = '/atualizacoes',
    loadingKey: string = 'global'
  ) => {
    setIsBroadcastingId(loadingKey)
    try {
      const recipients = await fetchAllRecipientIds()
      if (recipients.length === 0) {
        addToast('Nenhum usuário encontrado para envio.', 'error')
        setIsBroadcastingId(null)
        return
      }

      // Firestore batch limit is 500 operations
      const chunks: string[][] = []
      for (let i = 0; i < recipients.length; i += 450) {
        chunks.push(recipients.slice(i, i + 450))
      }

      for (const chunk of chunks) {
        const batch = writeBatch(db)
        chunk.forEach(recipientId => {
          const notifRef = doc(collection(db, 'notifications'))
          batch.set(notifRef, {
            userId: recipientId,
            title: notifTitle,
            text: notifText,
            type: 'update',
            route,
            unread: true,
            createdAt: serverTimestamp()
          })
        })
        await batch.commit()
      }

      addToast(
        `🔔 Notificação de atualização enviada para ${recipients.length} membros da plataforma!`,
        'success'
      )
    } catch (e) {
      console.error('Erro ao disparar notificação de atualização:', e)
      addToast('Erro ao enviar notificação para os membros.', 'error')
    } finally {
      setIsBroadcastingId(null)
    }
  }

  const handlePublishUpdate = async () => {
    if (!title.trim() || !summary.trim()) {
      addToast('Preencha o título e o resumo da atualização.', 'error')
      return
    }

    setIsPublishing(true)
    try {
      const highlights = highlightsText
        .split('\n')
        .map(line => line.replace(/^[•\-*]\s*/, '').trim())
        .filter(Boolean)

      const newId = `update-${Date.now()}`
      const catConfig = CATEGORY_CONFIG[category]
      const todayStr = new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })

      await setDoc(doc(db, 'platform_updates', newId), {
        version: version.trim() || 'v3.1.0',
        date: todayStr,
        category,
        categoryLabel: catConfig.label,
        title: title.trim(),
        summary: summary.trim(),
        highlights,
        actionRoute: actionRoute.trim() || '/atualizacoes',
        actionLabel: actionLabel.trim() || 'Explorar Novidade',
        createdAtMs: Date.now(),
        createdAt: serverTimestamp(),
        authorEmail: user?.email || 'admin'
      })

      if (sendNotificationToAll) {
        const bulletPreview =
          highlights.length > 0 ? ` Destaques: ${highlights.slice(0, 2).join(' | ')}` : ''
        await broadcastUpdateNotification(
          `🚀 Atualização ${version.trim()}: ${title.trim()}`,
          `${summary.trim()}${bulletPreview}`,
          actionRoute.trim() || '/atualizacoes',
          newId
        )
      } else {
        addToast('Atualização publicada com sucesso no Changelog!', 'success')
      }

      setTitle('')
      setSummary('')
      setHighlightsText('')
      setShowAdminModal(false)
    } catch (e) {
      console.error('Erro ao publicar atualização:', e)
      addToast('Erro ao salvar atualização.', 'error')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleDeleteUpdate = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'platform_updates', id))
      addToast('Nota de atualização removida.', 'success')
    } catch (e) {
      console.error('Erro ao remover atualização:', e)
      addToast('Erro ao remover atualização.', 'error')
    }
  }

  const handleCopySingleUpdateWhatsApp = (item: PlatformUpdateItem) => {
    const bullets = item.highlights.map(h => `✅ ${h}`).join('\n')
    const msg = `🚀 *ATUALIZAÇÃO GHOSTMARKET AI (${item.version})*\n\n*${item.title}*\n${item.summary}\n\n*O que entrou no ar:*\n${bullets}\n\n👉 *Teste agora na plataforma:*\n${window.location.origin}${item.actionRoute || '/atualizacoes'}`
    navigator.clipboard.writeText(msg)
    setCopiedId(item.id)
    addToast('Comunicado copiado! Pronto para colar no grupo do WhatsApp.', 'success')
    setTimeout(() => setCopiedId(null), 2500)
  }

  const handleCopyMegaList = () => {
    navigator.clipboard.writeText(MEGA_UPDATE_WHATSAPP_TEXT)
    setCopiedMegaList(true)
    addToast('Lista completa da Mega Atualização 3.0 copiada para o WhatsApp!', 'success')
    setTimeout(() => setCopiedMegaList(false), 3000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-br from-[#0c1512] via-[#09090B] to-[#111118] p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CENTRAL DE ATUALIZAÇÕES & NOVIDADES • V3.0 NO AR</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Tudo que foi adicionado para acelerar seus fechamentos
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Acompanhe em tempo real todas as novas ferramentas, melhorias de conversão e recursos
              lançados no GhostMarket AI. Clique em qualquer novidade para testar imediatamente.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleCopyMegaList}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-zinc-100 transition-all cursor-pointer"
            >
              {copiedMegaList ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Lista Copiada p/ WhatsApp!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-400" />
                  <span>Copiar Resumo p/ Grupo WhatsApp</span>
                </>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => setShowAdminModal(prev => !prev)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Atualização & Disparo</span>
              </button>
            )}
          </div>
        </div>

        {/* Admin Quick Broadcast Bar */}
        {isAdmin && (
          <div className="mt-6 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950/60 rounded-xl p-4 border">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <Megaphone className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Painel Admin de Disparo de Atualizações
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-500/20 text-emerald-300">
                    ADMIN EXCLUSIVO
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Notifique o sininho de todos os membros sobre a Mega Atualização 3.0 ou crie novos comunicados.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                disabled={isBroadcastingId === 'mega-3-0'}
                onClick={() =>
                  broadcastUpdateNotification(
                    '🚀 MEGA ATUALIZAÇÃO 3.0 NO AR!',
                    'Novo GhostStudio (+55 modelos ao vivo), Painel Admin do Cliente com senha blindada, Sistema de Patentes, Copiloto X1 e Dossiê CNPJ 1-Clique já disponíveis!',
                    '/atualizacoes',
                    'mega-3-0'
                  )
                }
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                {isBroadcastingId === 'mega-3-0' ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Bell className="w-3.5 h-3.5" />
                )}
                <span>Notificar Todos sobre a Mega 3.0</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Admin Publisher Form Modal / Drawer */}
      {isAdmin && showAdminModal && (
        <div className="rounded-2xl border border-emerald-500/40 bg-[#0C0D12] p-6 shadow-2xl space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Send className="w-5 h-5 text-emerald-400" />
              <div>
                <h2 className="text-base font-bold text-white">
                  Publicar Nova Atualização & Disparar Notificação Oficial
                </h2>
                <p className="text-xs text-zinc-400">
                  A atualização ficará salva no mural de novidades e enviará um alerta direto no sininho de todos os usuários.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAdminModal(false)}
              className="text-xs text-zinc-400 hover:text-white px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 cursor-pointer"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Versão (ex: v3.1.0)
              </label>
              <input
                type="text"
                value={version}
                onChange={e => setVersion(e.target.value)}
                placeholder="v3.1.0"
                className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Categoria da Atualização
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as any)}
                className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="feature">🚀 Nova Função</option>
                <option value="improvement">⚡ Melhoria</option>
                <option value="security">🔐 Segurança & Painel</option>
                <option value="fix">🛠️ Correção</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Atalho da Ferramenta no SaaS
              </label>
              <select
                value={actionRoute}
                onChange={e => {
                  setActionRoute(e.target.value)
                  const labels: Record<string, string> = {
                    '/builder': 'Abrir GhostStudio',
                    '/sites': 'Ver Meus Sites',
                    '/prompt-builder': 'Abrir Modelos & Prompts',
                    '/ranking': 'Ver Patentes & Ranking',
                    '/cnpj': 'Abrir Dossiê CNPJ',
                    '/proposta': 'Abrir Proposta PDF',
                    '/scanner': 'Abrir Scanner de Leads',
                    '/creator': 'Abrir Creator IA',
                    '/dashboard': 'Ir para o Dashboard'
                  }
                  if (labels[e.target.value]) setActionLabel(labels[e.target.value])
                }}
                className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="/builder">GhostStudio & Hospedagem (/builder)</option>
                <option value="/sites">Meus Sites & Painel do Cliente (/sites)</option>
                <option value="/prompt-builder">Modelos & Prompts (/prompt-builder)</option>
                <option value="/ranking">Ranking & Patentes (/ranking)</option>
                <option value="/cnpj">Dossiê CNPJ (/cnpj)</option>
                <option value="/proposta">Proposta & Contrato PDF (/proposta)</option>
                <option value="/scanner">Scanner de Leads (/scanner)</option>
                <option value="/creator">Creator IA (/creator)</option>
                <option value="/dashboard">Resumo Global (/dashboard)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Título da Atualização
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Novos Templates de Clínicas Estéticas + Disparo Rápido no CRM"
              className="w-full h-10 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Resumo Geral (aparece também na notificação do sininho)
            </label>
            <textarea
              rows={2}
              value={summary}
              onChange={e => setSummary(e.target.value)}
              placeholder="Explique de forma direta como essa novidade ajuda os membros a venderem mais..."
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Lista de itens adicionados / melhorados (1 item por linha)
            </label>
            <textarea
              rows={4}
              value={highlightsText}
              onChange={e => setHighlightsText(e.target.value)}
              placeholder={`Adicionados 10 novos templates de estética e odontologia\nNovo botão de compartilhamento direto no WhatsApp\nMelhoria na velocidade de carregamento dos sites`}
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-zinc-800">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendNotificationToAll}
                onChange={e => setSendNotificationToAll(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500"
              />
              <span className="text-xs font-medium text-zinc-200">
                🔔 Enviar notificação automática no sininho de <strong>todos os usuários</strong> agora
              </span>
            </label>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAdminModal(false)}
                className="px-4 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-300 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isPublishing}
                onClick={handlePublishUpdate}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {isPublishing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {sendNotificationToAll
                    ? 'Publicar & Notificar Todos os Membros'
                    : 'Publicar no Mural'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'Todas as Atualizações' },
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
          Exibindo {filteredUpdates.length} notas de lançamento
        </span>
      </div>

      {/* Updates Feed */}
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

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopySingleUpdateWhatsApp(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 transition-colors cursor-pointer"
                    title="Copiar texto formatado para WhatsApp"
                  >
                    {copiedId === item.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Copiar p/ WhatsApp</span>
                      </>
                    )}
                  </button>

                  {isAdmin && (
                    <button
                      disabled={isBroadcastingId === item.id}
                      onClick={() =>
                        broadcastUpdateNotification(
                          `🚀 Atualização: ${item.title}`,
                          item.summary,
                          item.actionRoute || '/atualizacoes',
                          item.id
                        )
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-xs font-medium text-emerald-300 transition-colors cursor-pointer disabled:opacity-50"
                      title="Disparar aviso desta atualização no sininho de todos os membros"
                    >
                      {isBroadcastingId === item.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Bell className="w-3.5 h-3.5" />
                      )}
                      <span className="hidden sm:inline">Notificar Membros</span>
                    </button>
                  )}

                  {isAdmin && !item.isBuiltIn && (
                    <button
                      onClick={() => handleDeleteUpdate(item.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 transition-colors cursor-pointer"
                      title="Excluir nota de atualização"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{item.summary}</p>
              </div>

              {item.highlights && item.highlights.length > 0 && (
                <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-xl p-4 space-y-2">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
                    O que foi adicionado / melhorado:
                  </div>
                  <ul className="space-y-2">
                    {item.highlights.map((bullet, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
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
                    <span>{item.actionLabel || 'Abrir Ferramenta'}</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Ready-to-copy WhatsApp Box at Bottom */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0B0B0F] p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
              Pronto para Copiar e Enviar
            </span>
            <h3 className="text-base font-bold text-white mt-0.5">
              Mensagem Oficial da Mega Atualização 3.0 para Grupo da Comunidade (WhatsApp)
            </h3>
          </div>
          <button
            onClick={handleCopyMegaList}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            {copiedMegaList ? (
              <>
                <Check className="w-4 h-4" />
                <span>Texto Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copiar Mensagem Completa</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/90 text-xs text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto custom-scrollbar">
          {MEGA_UPDATE_WHATSAPP_TEXT}
        </pre>
      </div>
    </div>
  )
}
