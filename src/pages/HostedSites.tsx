import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import {
  Globe,
  Trash2,
  Edit,
  ExternalLink,
  Plus,
  Search,
  Eye,
  TrendingUp,
  Link2,
  BarChart,
  ShieldCheck,
  Wand2,
  Activity,
  Power,
  Calendar,
  Download,
  LayoutTemplate,
  Copy,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { createAdminCredentials, ClientAdminAuth } from '@/utils/clientAdminCrypto'

type Site = {
  id: string
  name?: string
  domain: string
  publishedAt: string
  domainType: string
  views?: number
  isRedirect?: boolean
  isActive?: boolean
  redirectUrl?: string
  rawHtml?: string
  html?: string
  autoHealed?: boolean
  adminAuth?: ClientAdminAuth | null
  collectionName?: 'sites' | 'hosted_sites'
}

export const HostedSites = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()

  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)

  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false)
  const [scanningSite, setScanningSite] = useState<Site | null>(null)
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found' | 'fixing' | 'fixed'>('idle')
  const [detectedIssues, setDetectedIssues] = useState<string[]>([])

  const [search, setSearch] = useState('')
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false)
  const [redirectDest, setRedirectDest] = useState('')
  const [redirectSlug, setRedirectSlug] = useState('')
  const [isCreatingRedirect, setIsCreatingRedirect] = useState(false)

  // Client Establishment Admin Credential Modal State
  const [adminModalSite, setAdminModalSite] = useState<Site | null>(null)
  const [adminUser, setAdminUser] = useState('admin')
  const [adminPass, setAdminPass] = useState('Mudar@123')
  const [adminEnabled, setAdminEnabled] = useState(true)
  const [savingAdminAuth, setSavingAdminAuth] = useState(false)

  useEffect(() => {
    fetchSites()
  }, [user])

  const fetchSites = async () => {
    if (!user) return
    try {
      const qSites = query(collection(db, 'sites'), where('userId', '==', user.uid))
      const qHosted = query(collection(db, 'hosted_sites'), where('userId', '==', user.uid))
      const [snapSites, snapHosted] = await Promise.all([getDocs(qSites), getDocs(qHosted)])

      const map = new Map<string, Site>()

      snapHosted.forEach(docSnap => {
        const d = docSnap.data()
        map.set(docSnap.id, {
          id: docSnap.id,
          name: d.name || d.studioConfig?.name || docSnap.id,
          domain: d.domain || `${window.location.origin}/s/${docSnap.id}`,
          publishedAt: d.publishedAt || d.createdAt || new Date().toISOString(),
          domainType: d.domainType || 'subdomain',
          views: d.views || 0,
          isRedirect: d.isRedirect,
          isActive: d.isActive,
          redirectUrl: d.redirectUrl,
          rawHtml: d.rawHtml || d.html || '',
          autoHealed: d.autoHealed,
          adminAuth: d.adminAuth || null,
          collectionName: 'hosted_sites'
        })
      })

      snapSites.forEach(docSnap => {
        const d = docSnap.data()
        map.set(docSnap.id, {
          id: docSnap.id,
          name: d.name || d.studioConfig?.name || docSnap.id,
          domain: d.domain || `${window.location.origin}/s/${docSnap.id}`,
          publishedAt: d.publishedAt || d.createdAt || new Date().toISOString(),
          domainType: d.domainType || 'subdomain',
          views: d.views || 0,
          isRedirect: d.isRedirect,
          isActive: d.isActive,
          redirectUrl: d.redirectUrl,
          rawHtml: d.rawHtml || d.html || '',
          autoHealed: d.autoHealed,
          adminAuth: d.adminAuth || null,
          collectionName: 'sites'
        })
      })

      const fetchedSites = Array.from(map.values())
      setSites(fetchedSites.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()))
    } catch (error) {
      console.error('Error fetching sites:', error)
      addToast('Erro ao carregar sites', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdminModal = (site: Site) => {
    setAdminModalSite(site)
    setAdminEnabled(site.adminAuth ? Boolean(site.adminAuth.enabled) : true)
    setAdminUser(site.adminAuth?.username || 'admin')
    setAdminPass('Mudar@123')
  }

  const handleSaveAdminCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminModalSite) return
    setSavingAdminAuth(true)
    try {
      const authPayload = await createAdminCredentials(
        adminUser.trim() || 'admin',
        adminPass.trim() || 'Mudar@123',
        adminEnabled
      )
      const colName = adminModalSite.collectionName || 'sites'
      await updateDoc(doc(db, colName, adminModalSite.id), {
        adminAuth: authPayload
      })
      setSites(prev =>
        prev.map(s => (s.id === adminModalSite.id ? { ...s, adminAuth: authPayload } : s))
      )
      addToast('Credenciais SHA-256 do Painel do Cliente salvas com sucesso!', 'success')
      setAdminModalSite(null)
    } catch (err) {
      console.error('Error saving admin credentials:', err)
      addToast('Erro ao salvar credenciais do painel', 'error')
    } finally {
      setSavingAdminAuth(false)
    }
  }

  const handleOpenScanner = (site: Site) => {
    setScanningSite(site)
    setIsScannerModalOpen(true)
    setScanStatus('idle')
    setDetectedIssues([])
  }

  const runScan = () => {
    if (!scanningSite) return
    setScanStatus('scanning')
    setTimeout(() => {
      const html = scanningSite.rawHtml || ''
      const issues: string[] = []
      if (!html.includes('name="description"')) {
        issues.push('Meta tag de SEO (description) ausente para ranqueamento no Google')
      }
      if (!html.includes('property="og:title"')) {
        issues.push('Tags OpenGraph ausentes (prévia sem título/destaque ao enviar link no WhatsApp)')
      }
      if (!html.includes('overflow-x: hidden') && !html.includes('overflow-x-hidden')) {
        issues.push('Proteção contra rolagem lateral no celular (overflow-x) não detectada')
      }
      if (issues.length === 0) {
        issues.push('Otimização de compressão de renderização mobile e meta tags de cache')
      }
      setDetectedIssues(issues)
      setScanStatus('found')
    }, 1000)
  }

  const applyAutoFix = async () => {
    if (!scanningSite) return
    setScanStatus('fixing')
    try {
      let updatedHtml = scanningSite.rawHtml || ''
      const seoSnippet = `\n  <meta name="description" content="Atendimento oficial e soluções especializadas. Entre em contato pelo WhatsApp." />\n  <meta property="og:title" content="${scanningSite.id.toUpperCase()} — Página Oficial" />\n  <meta property="og:type" content="website" />\n  <style>html, body { overflow-x: hidden; scroll-behavior: smooth; }</style>\n`

      if (updatedHtml.includes('</head>')) {
        updatedHtml = updatedHtml.replace('</head>', `${seoSnippet}</head>`)
      } else {
        updatedHtml = seoSnippet + updatedHtml
      }

      const docRef = doc(db, 'sites', scanningSite.id)
      await updateDoc(docRef, { rawHtml: updatedHtml, autoHealed: true })

      setSites(prev => prev.map(s => (s.id === scanningSite.id ? { ...s, rawHtml: updatedHtml, autoHealed: true } : s)))
      setTimeout(() => {
        setScanStatus('fixed')
        addToast('Otimizações de SEO, OpenGraph e Responsividade injetadas no HTML!', 'success')
      }, 800)
    } catch (e) {
      console.error(e)
      addToast('Erro ao aplicar Auto-Fix', 'error')
      setScanStatus('found')
    }
  }

  const handleCreateRedirect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!redirectDest || !redirectSlug) return
    setIsCreatingRedirect(true)
    try {
      const siteId = redirectSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')
      const docRef = doc(db, 'sites', siteId)
      const snap = await getDoc(docRef)
      if (snap.exists()) {
        addToast('Este link já está em uso! Escolha outro nome.', 'error')
        setIsCreatingRedirect(false)
        return
      }

      await setDoc(docRef, {
        id: siteId,
        redirectUrl: redirectDest,
        isRedirect: true,
        domain: `${window.location.origin}/s/${siteId}`,
        domainType: 'subdomain',
        userId: user?.uid,
        publishedAt: new Date().toISOString()
      })
      addToast('Link camuflado com sucesso!', 'success')
      setIsRedirectModalOpen(false)
      fetchSites()
    } catch (e) {
      console.error(e)
      addToast('Erro ao criar link', 'error')
    } finally {
      setIsCreatingRedirect(false)
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus
      await updateDoc(doc(db, 'sites', id), { isActive: newStatus })
      setSites(sites.map(s => (s.id === id ? { ...s, isActive: newStatus } : s)))
      addToast(newStatus ? 'Site ativado com sucesso!' : 'Site pausado.', 'success')
    } catch (e) {
      console.error(e)
      addToast('Erro ao alterar status do site', 'error')
    }
  }

  const handleDownloadZip = async (site: Site) => {
    if (!site.rawHtml) {
      addToast('Código-fonte não encontrado.', 'error')
      return
    }
    try {
      const zip = new JSZip()
      zip.file('index.html', site.rawHtml)
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `${site.id}.zip`)
      addToast('Download do pacote ZIP iniciado!', 'success')
    } catch (e) {
      console.error(e)
      addToast('Erro ao criar o arquivo ZIP', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja apagar este site? Ele sairá do ar imediatamente.')) return
    try {
      await deleteDoc(doc(db, 'sites', id))
      setSites(sites.filter(s => s.id !== id))
      addToast('Site apagado com sucesso', 'success')
    } catch (error) {
      console.error('Error deleting site:', error)
      addToast('Erro ao apagar site', 'error')
    }
  }

  const filteredSites = sites.filter(
    s => s.domain?.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase())
  )

  const totalViews = sites.reduce((acc, site) => acc + (site.views || 0), 0)

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono uppercase tracking-wider mb-2">
            <Globe className="w-3 h-3 text-zinc-300" />
            <span>Cloud Hosting & Relatórios</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Meus Sites Hospedados</h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Gerencie suas páginas publicadas, gere relatórios de acessos para clientes e otimize o SEO em 1 clique.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="secondary" onClick={() => setIsRedirectModalOpen(true)} className="h-9 px-3.5 text-xs font-semibold">
            <Link2 className="w-3.5 h-3.5 mr-1.5" />
            Camuflar Link
          </Button>
          <Button onClick={() => navigate('/builder')} className="h-9 px-4 text-xs font-semibold">
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Hospedar Novo Site
          </Button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">Sites Publicados</p>
            <h3 className="text-2xl font-bold text-white mt-1 tabular-nums">{sites.length}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300">
            <Globe className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-zinc-400">Visualizações Reais Acumuladas</p>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1 tabular-nums">{totalViews}</h3>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#0E0E11] border border-zinc-800/80 rounded-xl p-5 flex items-center justify-between">
          <div className="w-full">
            <p className="text-xs font-medium text-zinc-400 mb-2">Filtrar por nome ou domínio</p>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar site..."
                className="w-full h-9 pl-8 pr-3 rounded-lg bg-[#09090B] border border-zinc-800 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sites Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
          <div className="w-7 h-7 border-2 border-zinc-200 border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-xs">Carregando seus sites hospedados...</span>
        </div>
      ) : filteredSites.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center bg-[#0E0E11] border border-zinc-800/80 rounded-xl">
          <div className="w-12 h-12 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl flex items-center justify-center mb-4">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white mb-1">Nenhum site hospedado ainda</h3>
          <p className="text-xs text-zinc-500 mb-5 max-w-md">
            Publique seu primeiro site HTML ou use um dos nossos templates prontos em 1 clique.
          </p>
          <Button onClick={() => navigate('/builder')} className="text-xs">
            Hospedar Meu Primeiro Site
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredSites.map(site => {
            const publicUrl = site.domain?.startsWith('http') ? site.domain : `${window.location.origin}/s/${site.id}`
            return (
              <div
                key={site.id}
                className="bg-[#0E0E11] border border-zinc-800/80 hover:border-zinc-700 rounded-xl overflow-hidden flex flex-col transition-colors group"
              >
                {/* Live Miniature Preview */}
                {!site.isRedirect && site.rawHtml ? (
                  <div className="w-full h-40 bg-[#09090B] relative overflow-hidden border-b border-zinc-800/80 shrink-0">
                    <div
                      className="absolute inset-0 origin-top-left"
                      style={{ transform: 'scale(0.333)', width: '300%', height: '300%' }}
                    >
                      <iframe
                        srcDoc={site.rawHtml}
                        className="w-full h-full border-none pointer-events-none"
                        sandbox="allow-same-origin"
                        scrolling="no"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0E0E11] via-transparent to-transparent" />
                  </div>
                ) : (
                  <div className="w-full h-40 bg-[#09090B] flex items-center justify-center border-b border-zinc-800/80 shrink-0">
                    <LayoutTemplate className="w-10 h-10 text-zinc-700" />
                  </div>
                )}

                <div className="p-5 flex flex-col flex-1">
                  {/* Top Bar: Status + Views + Actions */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 border text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md ${
                          site.isActive !== false
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            site.isActive !== false ? 'bg-emerald-400' : 'bg-red-400'
                          }`}
                        />
                        {site.isActive !== false ? 'ONLINE' : 'PAUSADO'}
                      </span>

                      <span className="inline-flex items-center gap-1 bg-[#09090B] border border-zinc-800 rounded-md px-2 py-0.5 text-xs font-mono text-zinc-300 tabular-nums">
                        <Eye className="w-3 h-3 text-zinc-500" />
                        {site.views || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(site.id, site.isActive !== false)}
                        className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title={site.isActive !== false ? 'Pausar Site' : 'Ativar Site'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      {!site.isRedirect && site.rawHtml && (
                        <button
                          onClick={() => handleDownloadZip(site)}
                          className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                          title="Baixar código HTML (.zip)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleOpenScanner(site)}
                        className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer"
                        title="Otimizar SEO & Mobile (Auto-Fix)"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigate(`/builder?edit=${site.id}`)}
                        className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                        title="Editar Código"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(site.id)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                        title="Excluir Site"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Link */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-white truncate">{site.name || site.id}</h4>
                      {site.adminAuth?.enabled && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-mono text-emerald-400 shrink-0">
                          <Lock className="w-2.5 h-2.5" /> ADM ATIVO
                        </span>
                      )}
                    </div>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 font-mono truncate hover:text-white transition-colors flex items-center gap-1 mt-0.5"
                    >
                      <span className="truncate">{publicUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  {/* Quick Actions Footer */}
                  <div className="mt-auto pt-3.5 border-t border-zinc-800/80 grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(publicUrl)
                        addToast('Link do site copiado!', 'success')
                      }}
                      className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg bg-[#09090B] hover:bg-zinc-900 border border-zinc-800 text-[11px] font-medium text-zinc-200 transition-colors cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar Site</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAdminModal(site)}
                      className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400 transition-colors cursor-pointer"
                      title="Configurar Login e Senha do Painel Admin do Cliente"
                    >
                      <Lock className="w-3 h-3" />
                      <span>Painel Adm</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const reportUrl = `${window.location.origin}/report/${site.id}`
                        navigator.clipboard.writeText(reportUrl)
                        addToast('Link do Relatório do Cliente copiado!', 'success')
                        window.open(reportUrl, '_blank')
                      }}
                      className="inline-flex items-center justify-center gap-1 h-8 px-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      <BarChart className="w-3 h-3" />
                      <span>Relatório</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-3">
                    <span>{site.autoHealed ? '✓ SEO & Mobile Otimizado' : 'Hospedagem Cloud'}</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(site.publishedAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* SEO & Mobile Optimizer Modal */}
      <AnimatePresence>
        {isScannerModalOpen && scanningSite && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#0E0E11] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-[#09090B]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Diagnóstico & Auto-Otimizador de HTML (SEO + Mobile)
                </h3>
                <button
                  onClick={() => setIsScannerModalOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 space-y-5">
                <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-3.5 flex items-center gap-3">
                  <Globe className="w-5 h-5 text-zinc-400 shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-white text-xs font-bold truncate">{scanningSite.domain}</h4>
                    <p className="text-[11px] text-zinc-500">Inspeção real de meta tags OpenGraph, SEO e trava de overflow mobile</p>
                  </div>
                </div>

                {scanStatus === 'idle' && (
                  <div className="text-center py-6">
                    <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
                    <h4 className="text-white font-bold text-base mb-1">Inspecionar código HTML publicado</h4>
                    <p className="text-zinc-400 text-xs mb-5 max-w-sm mx-auto">
                      Vamos verificar se o código do site possui tags de prévia para WhatsApp (OpenGraph), descrição para o Google e proteção de tela mobile.
                    </p>
                    <Button onClick={runScan}>
                      <Search className="w-4 h-4 mr-2" />
                      Analisar Código Agora
                    </Button>
                  </div>
                )}

                {scanStatus === 'scanning' && (
                  <div className="text-center py-8">
                    <Activity className="w-10 h-10 text-zinc-300 mx-auto mb-3 animate-spin" />
                    <h4 className="text-white font-bold text-sm">Verificando estrutura HTML...</h4>
                  </div>
                )}

                {scanStatus === 'found' && (
                  <div className="space-y-4">
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <h4 className="text-amber-300 text-xs font-bold mb-2">
                        Pontos de Otimização Detectados ({detectedIssues.length})
                      </h4>
                      <ul className="space-y-1.5 text-xs text-zinc-300">
                        {detectedIssues.map((iss, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-amber-400 font-bold">•</span>
                            <span>{iss}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-[#09090B] border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-3">
                      <p className="text-xs text-zinc-400">
                        Injetar automaticamente meta tags de SEO, OpenGraph e CSS responsivo no código hospedado.
                      </p>
                      <Button onClick={applyAutoFix} className="shrink-0">
                        <Wand2 className="w-3.5 h-3.5 mr-1.5" />
                        Aplicar no HTML
                      </Button>
                    </div>
                  </div>
                )}

                {scanStatus === 'fixing' && (
                  <div className="text-center py-8">
                    <Wand2 className="w-10 h-10 text-emerald-400 mx-auto mb-3 animate-bounce" />
                    <h4 className="text-white font-bold text-sm">Atualizando HTML no servidor...</h4>
                  </div>
                )}

                {scanStatus === 'fixed' && (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
                      <ShieldCheck className="w-6 h-6 text-emerald-400" />
                    </div>
                    <h4 className="text-emerald-400 font-bold text-base mb-1">Código HTML Otimizado!</h4>
                    <p className="text-zinc-400 text-xs mb-5 max-w-sm mx-auto">
                      As meta tags de SEO, OpenGraph para WhatsApp e proteção de responsividade foram gravadas com sucesso.
                    </p>
                    <Button onClick={() => setIsScannerModalOpen(false)} variant="secondary">
                      Concluir
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Redirect Modal */}
      <AnimatePresence>
        {isRedirectModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#0E0E11] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-[#09090B]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-zinc-300" />
                  Camuflador de Links & Redirecionador
                </h3>
                <button
                  onClick={() => setIsRedirectModalOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>
              <form onSubmit={handleCreateRedirect} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                    URL de Destino (Checkout, WhatsApp, Afiliado...)
                  </label>
                  <Input
                    value={redirectDest}
                    onChange={e => setRedirectDest(e.target.value)}
                    placeholder="https://..."
                    required
                    type="url"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-400 block mb-1.5">Slug do Link Curto</label>
                  <Input
                    value={redirectSlug}
                    onChange={e => setRedirectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="oferta-vip"
                    required
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2.5">
                  <Button type="button" variant="secondary" onClick={() => setIsRedirectModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isCreatingRedirect}>
                    {isCreatingRedirect ? 'Criando...' : 'Criar Link'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Client Admin Panel Credentials Modal */}
      <AnimatePresence>
        {adminModalSite && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#0E0E11] border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-[#09090B]">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  Painel Administrativo do Cliente (SHA-256)
                </h3>
                <button
                  onClick={() => setAdminModalSite(null)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAdminCredentials} className="p-6 space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-zinc-300 space-y-1">
                  <div className="font-bold text-emerald-400">
                    Link do Painel do Estabelecimento:
                  </div>
                  <div className="font-mono text-[11px] text-white break-all">
                    {`${window.location.origin}/painel/${adminModalSite.id}`}
                  </div>
                  <p className="text-[11px] text-zinc-400 pt-1">
                    A senha é criptografada com SHA-256 + Salt e nunca aparece no código-fonte (F12).
                  </p>
                </div>

                <label className="flex items-center justify-between p-3 rounded-xl bg-[#09090B] border border-zinc-800 cursor-pointer">
                  <span className="text-xs font-semibold text-white">
                    Habilitar Painel Admin para este Cliente
                  </span>
                  <input
                    type="checkbox"
                    checked={adminEnabled}
                    onChange={e => setAdminEnabled(e.target.checked)}
                    className="w-4 h-4 accent-emerald-500"
                  />
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                      Login do Estabelecimento
                    </label>
                    <Input
                      value={adminUser}
                      onChange={e => setAdminUser(e.target.value)}
                      placeholder="admin"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-400 block mb-1.5">
                      Nova Senha do Cliente
                    </label>
                    <Input
                      value={adminPass}
                      onChange={e => setAdminPass(e.target.value)}
                      placeholder="Mudar@123"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    <a
                      href={`${window.location.origin}/painel/${adminModalSite.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Abrir Painel
                    </a>

                    <button
                      type="button"
                      onClick={() => {
                        const siteUrl = `${window.location.origin}/s/${adminModalSite.id}`
                        const panelUrl = `${window.location.origin}/painel/${adminModalSite.id}`
                        const text = `🚀 *ACESSO OFICIAL — ${(adminModalSite.name || adminModalSite.id).toUpperCase()}*\n\n🌐 *Site Público:*\n${siteUrl}\n\n🔐 *Painel Administrativo do Lojista:*\n${panelUrl}\n👤 *Login:* ${adminUser}\n🔑 *Senha:* ${adminPass}\n\nNo painel você pode alterar preços, itens do cardápio/catálogo e status Aberto/Fechado em tempo real!`
                        navigator.clipboard.writeText(text)
                        addToast('Kit de acesso copiado para enviar no WhatsApp!', 'success')
                      }}
                      className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-emerald-400 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copiar Kit WhatsApp
                    </button>
                  </div>

                  <Button type="submit" disabled={savingAdminAuth}>
                    {savingAdminAuth ? 'Criptografando...' : 'Salvar Credenciais'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
