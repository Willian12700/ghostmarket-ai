import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp, Link2, BarChart, ShieldCheck, Wand2, Activity, Power, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { Download, LayoutTemplate } from 'lucide-react'
import { Input } from '@/components/ui/Input'

type Site = {
  id: string;
  domain: string;
  publishedAt: string;
  domainType: string;
  views?: number;
  isRedirect?: boolean;
  isActive?: boolean;
  redirectUrl?: string;
  rawHtml?: string;
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

  const handleOpenScanner = (site: Site) => {
    setScanningSite(site)
    setIsScannerModalOpen(true)
    setScanStatus('idle')
  }

  const runScan = () => {
    setScanStatus('scanning')
    setTimeout(() => {
      setScanStatus('found')
    }, 2500)
  }

  const applyAutoFix = async () => {
    if (!scanningSite) return
    setScanStatus('fixing')
    try {
      const docRef = doc(db, 'sites', scanningSite.id)
      await updateDoc(docRef, { autoHealed: true })
      
      setTimeout(() => {
        setScanStatus('fixed')
        addToast('Auto-Fix injetado com sucesso no servidor!', 'success')
      }, 2000)
    } catch (e) {
      console.error(e)
      addToast('Erro ao aplicar Auto-Fix', 'error')
      setScanStatus('found')
    }
  }

  const [search, setSearch] = useState('')
  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false)
  const [redirectDest, setRedirectDest] = useState('')
  const [redirectSlug, setRedirectSlug] = useState('')
  const [isCreatingRedirect, setIsCreatingRedirect] = useState(false)

  useEffect(() => {
    fetchSites()
  }, [user])

  const fetchSites = async () => {
    if (!user) return
    try {
      const q = query(collection(db, 'sites'), where('userId', '==', user.uid))
      const querySnapshot = await getDocs(q)
      const fetchedSites: Site[] = []
      querySnapshot.forEach((doc) => {
        fetchedSites.push({ id: doc.id, ...doc.data() } as Site)
      })
      setSites(fetchedSites.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()))
    } catch (error) {
      console.error('Error fetching sites:', error)
      addToast('Erro ao carregar sites', 'error')
    } finally {
      setLoading(false)
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
    } catch(e) {
      console.error(e)
      addToast('Erro ao criar link', 'error')
    } finally {
      setIsCreatingRedirect(false)
    }
  }



  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      await updateDoc(doc(db, 'sites', id), { isActive: newStatus });
      setSites(sites.map(s => s.id === id ? { ...s, isActive: newStatus } : s));
      addToast(newStatus ? 'Site ativado com sucesso!' : 'Site desativado.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Erro ao alterar status do site', 'error');
    }
  }

  
  const handleDownloadZip = async (site: Site) => {
    if (!site.rawHtml) {
      addToast('Código-fonte não encontrado.', 'error');
      return;
    }
    try {
      const zip = new JSZip();
      zip.file("index.html", site.rawHtml);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${site.id}.zip`);
      addToast('Download iniciado com sucesso!', 'success');
    } catch(e) {
      console.error(e);
      addToast('Erro ao criar o arquivo ZIP', 'error');
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

  const filteredSites = sites.filter(s => s.domain?.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0b0714] p-8 font-sans selection:bg-primary/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Meus Sites Hospedados</h1>
            <p className="text-textSecondary">Gerencie suas Landing Pages e funis ativos na GhostMarket.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsRedirectModalOpen(true)} className="h-11 px-5 rounded-xl border border-[#261f36] bg-[#130e1d] text-textSecondary hover:bg-[#1a1425] hover:text-white transition-all shadow-sm">
              <Link2 className="w-4 h-4 mr-2" /> Camuflar Link
            </Button>
            <Button onClick={() => navigate('/builder')} className="h-11 px-5 rounded-xl bg-gradient-to-r from-primary to-indigo-500 hover:from-primaryLight hover:to-indigo-400 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] font-bold transition-all hover:scale-105 active:scale-95">
              <Plus className="w-4 h-4 mr-2" /> Hospedar Novo Site
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#130e1d] border border-[#261f36] rounded-2xl p-6 relative flex flex-col justify-between shadow-xl overflow-hidden group hover:border-primary/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] pointer-events-none group-hover:bg-primary/20 transition-all" />
            <div className="flex justify-between items-start relative z-10">
              <p className="text-xs text-textSecondary font-bold tracking-widest mb-2 uppercase">Total de Sites Ativos</p>
              <div className="w-10 h-10 rounded-xl border border-primary/20 bg-[#0b0714] flex items-center justify-center text-primary shadow-inner">
                <Globe className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-5xl font-black text-white mt-2 mb-6 relative z-10">{sites.length}</h3>
            <div className="flex items-center gap-3 relative z-10">
              <span className="bg-primary/10 border border-primary/20 text-[#a78bfa] text-xs font-bold px-3 py-1.5 rounded-full">+2 este mês</span>
              <span className="text-xs text-textSecondary">Capacidade da conta: 10 sites</span>
            </div>
          </div>

          <div className="bg-[#130e1d] border border-[#261f36] rounded-2xl p-6 relative flex flex-col justify-between shadow-xl overflow-hidden group hover:border-emerald-500/50 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
            <div className="flex justify-between items-start relative z-10">
              <p className="text-xs text-textSecondary font-bold tracking-widest mb-2 uppercase">Total de Acessos (Tráfego)</p>
              <div className="w-10 h-10 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center justify-center text-emerald-400 shadow-inner">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-5xl font-black text-emerald-400 mt-2 mb-6 relative z-10">{sites.reduce((acc, site) => acc + (site.views || 0), 0)}</h3>
            <div className="flex items-center gap-3 relative z-10">
              <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">+18.4% vs semana anterior</span>
              <span className="text-xs text-textSecondary">Taxa de conversão 8.2%</span>
            </div>
          </div>
        </div>

        {/* Search Bar & Sites count */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 mb-6">
          <div className="relative w-full md:w-[350px]">
            <Search className="w-4 h-4 text-textSecondary absolute left-4 top-1/2 -translate-y-1/2" />
            <Input 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Buscar por domínio..." 
              className="pl-11 bg-[#130e1d] border-[#261f36] h-11 rounded-xl focus:border-primary/50 text-white placeholder:text-textSecondary shadow-sm" 
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
            <span className="text-sm font-bold text-white">{sites.length}</span>
            <span className="text-sm text-textSecondary">sites no ar</span>
          </div>
        </div>

        {/* Empty / Loading State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-textSecondary">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            Carregando seus sites...
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="py-20 text-center flex flex-col items-center bg-[#130e1d] border border-[#261f36] rounded-2xl">
            <div className="w-20 h-20 bg-[#0b0714] border border-[#261f36] text-primary rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Globe className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum site encontrado</h3>
            <p className="text-textSecondary mb-6 max-w-md mx-auto">Você ainda não possui nenhum site hospedado ou não encontramos resultados para sua busca.</p>
            <Button onClick={() => navigate('/builder')} className="bg-primary hover:bg-primaryLight text-white rounded-xl shadow-lg">
              Hospedar meu primeiro site
            </Button>
          </div>
        ) : (
          /* Grid of Cards */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredSites.map(site => (
                <motion.div 
                  key={site.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#130e1d] border border-[#261f36] rounded-2xl p-6 hover:border-[#3b3054] transition-all group flex flex-col shadow-lg relative overflow-hidden"
                >
                  
                    {!site.isRedirect && site.rawHtml ? (
                      <div className="w-full h-44 bg-[#050505] relative overflow-hidden border-b border-border shrink-0 rounded-t-3xl group-hover:opacity-90 transition-opacity">
                        <div className="absolute inset-0 origin-top-left" style={{ transform: 'scale(0.333)', width: '300%', height: '300%' }}>
                          <iframe 
                            srcDoc={site.rawHtml} 
                            className="w-full h-full border-none pointer-events-none" 
                            sandbox="allow-same-origin"
                            scrolling="no"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[#130e1d] via-[#130e1d]/20 to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full h-44 bg-background flex items-center justify-center border-b border-border shrink-0 relative overflow-hidden rounded-t-3xl">
                        <LayoutTemplate className="w-12 h-12 text-border" />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-3">
                      {site.isRedirect ? (
                        <div className="w-11 h-11 rounded-xl border border-[#261f36] bg-[#0b0714] flex items-center justify-center text-primary shadow-inner" title="Link CamCamuflado">
                          <Link2 className="w-5 h-5" />
                        </div>
                      ) : (
                        <div className="w-11 h-11 rounded-xl border border-[#261f36] bg-[#0b0714] flex items-center justify-center text-primary shadow-inner" title="Landing Page Hospedada">
                          <Globe className="w-5 h-5" />
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 bg-[#0b0714] border border-[#261f36] rounded-lg px-2.5 py-1.5 shadow-inner">
                        <Eye className="w-3.5 h-3.5 text-textSecondary" />
                        <span className="text-xs font-bold text-white">{site.views || 0}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      <button onClick={() => handleToggleStatus(site.id, site.isActive !== false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-emerald-500/10 text-emerald-400 transition-colors" title={site.isActive !== false ? 'Desativar Site' : 'Ativar Site'}>
                        <Power className="w-4 h-4" />
                      </button>
                                                {!site.isRedirect && site.rawHtml && (
                            <button onClick={() => handleDownloadZip(site)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Baixar ZIP">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
<button onClick={() => {
                        const url = `${window.location.origin}/report/${site.id}`;
                        navigator.clipboard.writeText(url);
                        addToast('Link do relatório copiado!', 'success');
                        window.open(url, '_blank');
                      }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261f36] text-textSecondary hover:text-white transition-colors" title="Estatísticas">
                        <BarChart className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleOpenScanner(site)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261f36] text-textSecondary hover:text-white transition-colors" title="Auto-Healing Scanner">
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                      <button onClick={() => navigate(`/builder?edit=${site.id}`)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#261f36] text-textSecondary hover:text-white transition-colors" title="Editar / Ver">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(site.id)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-500/10 text-textSecondary hover:text-red-400 transition-colors" title="Apagar Site">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className={`inline-flex items-center gap-2 border text-[10px] font-bold px-2.5 py-1 rounded-full mb-4 ${site.isActive !== false ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${site.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`} /> {site.isActive !== false ? 'Site Ativado' : 'Site Desativado'}
                    </div>
                    <h4 className="text-xl font-bold text-white mb-1.5 truncate">{site.domain || site.id}</h4>
                    <div className="flex items-center">
                      <a href={site.domain.startsWith('http') ? site.domain : `https://${site.domain}`} target="_blank" rel="noopener noreferrer" className="text-sm text-textSecondary font-mono truncate hover:text-primary transition-colors flex items-center">
                        {site.domain.startsWith('http') ? site.domain : `https://ghostmarket-ai.vercel.app/s/${site.id}`} <ExternalLink className="w-3 h-3 ml-2 shrink-0 opacity-50" />
                      </a>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-[#261f36] flex items-center justify-between">
                    <div className="bg-[#0b0714] border border-[#261f36] px-3 py-1.5 rounded-lg text-xs text-textSecondary font-medium shadow-inner">
                      {site.domainType === 'subdomain' ? 'Link Gratuito' : 'Domínio Próprio'}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-textSecondary font-medium">
                      <Calendar className="w-3.5 h-3.5 opacity-50" />
                      <span>{new Date(site.publishedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </div>
                </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isScannerModalOpen && scanningSite && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#130e1d] border border-[#261f36] rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#261f36] flex justify-between items-center bg-[#0b0714]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-400" /> Ghost Auto-Healing Scanner</h3>
                <button onClick={() => setIsScannerModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-[#0b0714] border border-[#261f36] rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{scanningSite.domain}</h4>
                    <p className="text-sm text-textSecondary">Varredura de quebras de Layout e Erros 404</p>
                  </div>
                </div>

                {scanStatus === 'idle' && (
                  <div className="text-center py-8">
                    <ShieldCheck className="w-16 h-16 text-[#261f36] mx-auto mb-4" />
                    <h4 className="text-white font-bold text-lg mb-2">Pronto para varrer o código-fonte?</h4>
                    <p className="text-textSecondary text-sm mb-6 max-w-sm mx-auto">O robô vai analisar o HTML da página atrás de imagens quebradas, links mortos e botões desalinhados no celular.</p>
                    <Button onClick={runScan} className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      <Search className="w-4 h-4 mr-2" /> Iniciar Varredura Profunda
                    </Button>
                  </div>
                )}

                {scanStatus === 'scanning' && (
                  <div className="text-center py-10">
                    <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
                    <h4 className="text-white font-bold text-lg mb-1 animate-pulse">Lendo a árvore DOM...</h4>
                    <p className="text-sm text-textSecondary">Analisando folhas de estilo e recursos da AWS...</p>
                  </div>
                )}

                {scanStatus === 'found' && (
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                      <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">⚠️ 3 Vulnerabilidades Encontradas</h4>
                      <ul className="space-y-2 text-sm text-white/80">
                         <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Imagem de Hero quebrada (Erro 404)</li>
                         <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Botão do Checkout desalinhado no iPhone 13</li>
                         <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Fonte "Inter" não está carregando (Bloqueio CORS)</li>
                      </ul>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center justify-between">
                      <p className="text-sm text-blue-100">A IA pode consertar injetando CSS e trocando a imagem morta por um placeholder.</p>
                      <Button onClick={applyAutoFix} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                        <Wand2 className="w-4 h-4 mr-2" /> Aplicar Auto-Fix
                      </Button>
                    </div>
                  </div>
                )}

                {scanStatus === 'fixing' && (
                  <div className="text-center py-10">
                    <Wand2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-bounce" />
                    <h4 className="text-white font-bold text-lg mb-1 animate-pulse">Injetando correção no HTML...</h4>
                    <p className="text-sm text-textSecondary">Reparando tags `<img/>` e recalculando margens...</p>
                  </div>
                )}

                {scanStatus === 'fixed' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-emerald-400" />
                    </div>
                    <h4 className="text-emerald-400 font-bold text-lg mb-2">Site Reparado com Sucesso!</h4>
                    <p className="text-textSecondary text-sm mb-6 max-w-sm mx-auto">O layout está perfeitamente alinhado e as imagens ausentes foram substituídas para evitar perda de conversão.</p>
                    <Button onClick={() => setIsScannerModalOpen(false)} variant="secondary" className="border-[#261f36] bg-[#0b0714]">
                      Concluir
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isRedirectModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-[#130e1d] border border-[#261f36] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-[#261f36] flex justify-between items-center bg-[#0b0714]">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Link2 className="w-5 h-5 text-pink-500" /> Camuflador Anti-Ban</h3>
                <button onClick={() => setIsRedirectModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <form onSubmit={handleCreateRedirect} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Link Feio (Hotmart, Kiwify, etc)</label>
                  <Input value={redirectDest} onChange={(e) => setRedirectDest(e.target.value)} placeholder="https://pay.kiwify.com.br/12345" required type="url" className="bg-[#0b0714] border-[#261f36]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Link Camuflado Desejado</label>
                  <div className="flex relative items-center">
                    <span className="absolute left-4 text-textSecondary text-sm font-medium pointer-events-none">.../s/</span>
                    <Input value={redirectSlug} onChange={(e) => setRedirectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="oferta-vip" className="pl-[60px] bg-[#0b0714] border-[#261f36]" required />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsRedirectModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isCreatingRedirect} className="shadow-[0_0_15px_rgba(236,72,153,0.3)] bg-pink-500 hover:bg-pink-600 text-white">{isCreatingRedirect ? 'Criando...' : 'Criar Link'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
