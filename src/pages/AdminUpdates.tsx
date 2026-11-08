import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Megaphone,
  Bell,
  Send,
  Copy,
  Check,
  Trash2,
  Loader2,
  Sparkles,
  ExternalLink,
  Users
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
import {
  PlatformUpdateItem,
  MEGA_UPDATE_WHATSAPP_TEXT,
  BUILT_IN_UPDATES,
  CATEGORY_CONFIG
} from '@/pages/Updates'

export const AdminUpdates = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { addToast } = useToastStore()

  const isAdmin =
    user?.email === 'willrandrier@gmail.com' ||
    user?.email === 'souza.abencoado4@gmail.com' ||
    (user as any)?.role === 'admin'

  const [customUpdates, setCustomUpdates] = useState<PlatformUpdateItem[]>([])
  const [totalRecipientsCount, setTotalRecipientsCount] = useState<number>(0)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copiedMegaList, setCopiedMegaList] = useState(false)

  // Composer State
  const [version, setVersion] = useState('v3.1.0')
  const [category, setCategory] = useState<'feature' | 'improvement' | 'security' | 'fix'>('feature')
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [highlightsText, setHighlightsText] = useState('')
  const [actionRoute, setActionRoute] = useState('/builder')
  const [actionLabel, setActionLabel] = useState('Abrir GhostStudio')
  const [sendNotificationToAll, setSendNotificationToAll] = useState(true)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isBroadcastingId, setIsBroadcastingId] = useState<string | null>(null)

  // Quick Custom Notification Only (without creating changelog card)
  const [quickNotifTitle, setQuickNotifTitle] = useState('')
  const [quickNotifText, setQuickNotifText] = useState('')
  const [quickNotifRoute, setQuickNotifRoute] = useState('/atualizacoes')

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
      err => console.error('Erro ao carregar atualizações:', err)
    )

    fetchAllRecipientIds().then(ids => setTotalRecipientsCount(ids.length))

    return () => unsub()
  }, [])

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
      setTotalRecipientsCount(recipients.length)
      if (recipients.length === 0) {
        addToast('Nenhum usuário encontrado para envio.', 'error')
        setIsBroadcastingId(null)
        return
      }

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
        `🔔 Notificação de atualização disparada no sininho de ${recipients.length} membros!`,
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
        addToast('Atualização publicada no Mural de Novidades (/atualizacoes)!', 'success')
      }

      setTitle('')
      setSummary('')
      setHighlightsText('')
    } catch (e) {
      console.error('Erro ao publicar atualização:', e)
      addToast('Erro ao salvar atualização.', 'error')
    } finally {
      setIsPublishing(false)
    }
  }

  const handleQuickNotificationBroadcast = async () => {
    if (!quickNotifTitle.trim() || !quickNotifText.trim()) {
      addToast('Digite o título e a mensagem da notificação rápida.', 'error')
      return
    }
    await broadcastUpdateNotification(
      quickNotifTitle.trim(),
      quickNotifText.trim(),
      quickNotifRoute,
      'quick-notif'
    )
    setQuickNotifTitle('')
    setQuickNotifText('')
  }

  const handleDeleteUpdate = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'platform_updates', id))
      addToast('Nota de atualização removida do mural.', 'success')
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

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8 rounded-2xl border border-zinc-800 bg-[#0D0D11] text-center space-y-4">
        <h2 className="text-lg font-bold text-white">Área Restrita ao Administrador</h2>
        <p className="text-sm text-zinc-400">
          Para visualizar as novidades da plataforma, acesse o Mural Oficial de Atualizações.
        </p>
        <button
          onClick={() => navigate('/atualizacoes')}
          className="px-4 py-2 rounded-xl bg-emerald-500 text-zinc-950 text-xs font-bold cursor-pointer"
        >
          Ir para Novidades & Updates
        </button>
      </div>
    )
  }

  const allUpdates = [...customUpdates, ...BUILT_IN_UPDATES]

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20">
      {/* Admin Top Header */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-[#0c1512] via-[#09090B] to-[#111118] p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold">
            <Megaphone className="w-3.5 h-3.5" />
            <span>CENTRAL ADMIN • DISPARADOR DE ATUALIZAÇÕES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Disparar Notificações de Update & Gerenciar Changelog
          </h1>
          <p className="text-sm text-zinc-400">
            Área exclusiva da Administração para publicar novas notas em{' '}
            <code className="text-emerald-300">/atualizacoes</code> e disparar alertas com tag{' '}
            <span className="text-emerald-300 font-semibold">UPDATE</span> no sininho de todos os{' '}
            <strong className="text-white">{totalRecipientsCount || '...'}</strong> membros.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => navigate('/atualizacoes')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-zinc-400" />
            <span>Ver Mural dos Membros (/atualizacoes)</span>
          </button>

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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold shadow-[0_0_25px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
          >
            {isBroadcastingId === 'mega-3-0' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bell className="w-4 h-4" />
            )}
            <span>Disparar Aviso da Mega 3.0 p/ Todos</span>
          </button>
        </div>
      </div>

      {/* Grid: Left = Publish Full Update + Bell Notification | Right = Quick Bell Alert Only */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Publisher Form (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-800 bg-[#0C0D12] p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                <Send className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  1. Publicar Nova Atualização no Mural + Notificar Sininho
                </h2>
                <p className="text-xs text-zinc-400">
                  Cria um card completo em Novidades & Updates e envia notificação para todos os usuários.
                </p>
              </div>
            </div>
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
                Botão de Destino da Atualização
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
              placeholder="Ex: Sites Ilimitados Liberados + Novos Templates de Estética"
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
              placeholder="Explique de forma direta o que entrou no ar..."
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Lista de itens adicionados / melhorados (1 tópico por linha)
            </label>
            <textarea
              rows={4}
              value={highlightsText}
              onChange={e => setHighlightsText(e.target.value)}
              placeholder={`Sites ilimitados liberados para planos Mensal e Vitalício\nProteção automática contra domínio duplicado\nBotão rápido para criar vários sites em sequência`}
              className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-zinc-800">
            <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={sendNotificationToAll}
                onChange={e => setSendNotificationToAll(e.target.checked)}
                className="w-4 h-4 rounded accent-emerald-500"
              />
              <span className="text-xs font-medium text-zinc-200">
                🔔 Disparar alerta no sininho de todos os membros simultaneamente
              </span>
            </label>

            <button
              disabled={isPublishing}
              onClick={handlePublishUpdate}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {isPublishing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              <span>
                {sendNotificationToAll
                  ? 'Publicar & Disparar Notificação Agora'
                  : 'Apenas Publicar no Mural'}
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: Quick Bell Push Only + WhatsApp Copy */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-800 bg-[#0C0D12] p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
                <Bell className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  2. Disparo Rápido só no Sininho
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Envia uma notificação de atualização sem criar card novo no mural.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Título do Alerta
              </label>
              <input
                type="text"
                value={quickNotifTitle}
                onChange={e => setQuickNotifTitle(e.target.value)}
                placeholder="🚀 Nova melhoria liberada no GhostStudio!"
                className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Mensagem Curta
              </label>
              <textarea
                rows={3}
                value={quickNotifText}
                onChange={e => setQuickNotifText(e.target.value)}
                placeholder="Acabamos de liberar criação ilimitada de sites para todos os membros ativos. Clique para testar!"
                className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Link ao clicar na notificação
              </label>
              <select
                value={quickNotifRoute}
                onChange={e => setQuickNotifRoute(e.target.value)}
                className="w-full h-9 px-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="/atualizacoes">Mural de Novidades (/atualizacoes)</option>
                <option value="/builder">GhostStudio (/builder)</option>
                <option value="/sites">Meus Sites (/sites)</option>
                <option value="/ranking">Ranking & Patentes (/ranking)</option>
                <option value="/cnpj">Dossiê CNPJ (/cnpj)</option>
                <option value="/dashboard">Dashboard (/dashboard)</option>
              </select>
            </div>

            <button
              disabled={isBroadcastingId === 'quick-notif'}
              onClick={handleQuickNotificationBroadcast}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {isBroadcastingId === 'quick-notif' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Bell className="w-4 h-4" />
              )}
              <span>Enviar no Sininho de Todos</span>
            </button>
          </div>

          {/* WhatsApp Copy Card */}
          <div className="rounded-2xl border border-zinc-800 bg-[#0C0D12] p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase">
              <Sparkles className="w-4 h-4" />
              <span>Kit Grupo da Comunidade</span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Lista Completa da Mega Atualização 3.0 p/ WhatsApp
            </h3>
            <p className="text-xs text-zinc-400">
              Copie o texto formatado com todos os tópicos da atualização para enviar no grupo VIP.
            </p>
            <button
              onClick={handleCopyMegaList}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
            >
              {copiedMegaList ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Copiado para a Área de Transferência!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Texto p/ Grupo WhatsApp</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Manage Existing Updates & Re-Trigger Notifications */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0C0D12] p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">
              3. Histórico de Atualizações Publicadas (Reenviar Aviso ou Copiar p/ WhatsApp)
            </h2>
            <p className="text-xs text-zinc-400">
              Clique em "Disparar no Sininho" em qualquer item abaixo para notificar todos os usuários sobre aquela função específica.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 font-mono">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            {totalRecipientsCount} membros
          </span>
        </div>

        <div className="space-y-3">
          {allUpdates.map(item => {
            const catConfig = CATEGORY_CONFIG[item.category] || CATEGORY_CONFIG.feature
            const IconComponent = catConfig.icon

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[11px] font-mono font-bold text-white">
                      {item.version}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold ${catConfig.badgeClass}`}
                    >
                      <IconComponent className="w-3 h-3" />
                      <span>{item.categoryLabel || catConfig.label}</span>
                    </span>
                    <span className="text-[11px] text-zinc-500 font-mono">{item.date}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-zinc-400 line-clamp-2">{item.summary}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopySingleUpdateWhatsApp(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs text-zinc-300 cursor-pointer"
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
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 cursor-pointer disabled:opacity-50"
                  >
                    {isBroadcastingId === item.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Bell className="w-3.5 h-3.5" />
                    )}
                    <span>Disparar no Sininho</span>
                  </button>

                  {!item.isBuiltIn && (
                    <button
                      onClick={() => handleDeleteUpdate(item.id)}
                      className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 cursor-pointer"
                      title="Excluir atualização"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
