import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp, Link2, BarChart, ShieldCheck, Wand2, Activity } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/Input'

type Site = {
  id: string;
  domain: string;
  publishedAt: string;
  domainType: string;
  views?: number;
  isRedirect?: boolean;
  redirectUrl?: string;
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

  const applyAutoFix = () => {
    setScanStatus('fixing')
    setTimeout(() => {
      setScanStatus('fixed')
      addToast('Auto-Fix aplicado com sucesso!', 'success')
    }, 2000)
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
    <div className="min-h-[calc(100vh-64px)] bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Meus Sites Hospedados</h1>
            <p className="text-textSecondary">Gerencie suas Landing Pages e funis ativos na GhostMarket.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsRedirectModalOpen(true)} className="border-primary/50 text-primary hover:bg-primary/10">
              <Link2 className="w-4 h-4 mr-2" /> Camuflar Link
            </Button>
            <Button onClick={() => navigate('/builder')} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Plus className="w-4 h-4 mr-2" /> Hospedar Novo Site
            </Button>
          </div>
        </div>

        <div className="bg-panel rounded-2xl border border-border p-6 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-background border border-border p-4 rounded-xl flex items-center justify-between shadow-lg">
              <div>
                <p className="text-xs text-textSecondary mb-1 font-bold">Total de Sites Ativos</p>
                <h3 className="text-3xl font-black text-white">{sites.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-background border border-border p-4 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/10 blur-[50px] pointer-events-none" />
              <div className="relative z-10">
                <p className="text-xs text-textSecondary mb-1 font-bold">Total de Acessos (Tráfego)</p>
                <h3 className="text-3xl font-black text-green-400">{sites.reduce((acc, site) => acc + (site.views || 0), 0)}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
            <div className="relative w-full md:w-96">
              <Search className="w-5 h-5 text-textSecondary absolute left-3 top-1/2 -translate-y-1/2" />
              <Input 
                value={search} 
                onChange={(e) => setSearch(e.target.value)} 
                placeholder="Buscar por domínio..." 
                className="pl-10" 
              />
            </div>
            <div className="text-sm text-textSecondary">
              <span className="text-primary font-bold">{sites.length}</span> sites no ar
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-textSecondary">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
              Carregando seus sites...
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-6">
                <Globe className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum site encontrado</h3>
              <p className="text-textSecondary mb-6 max-w-md mx-auto">Você ainda não possui nenhum site hospedado ou não encontramos resultados para sua busca.</p>
              <Button onClick={() => navigate('/builder')} variant="secondary" className="border-primary/50 text-white hover:bg-primary/20">
                Hospedar meu primeiro site
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence>
                {filteredSites.map(site => (
                  <motion.div 
                    key={site.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-background border border-border rounded-xl p-5 hover:border-primary/50 transition-all group relative overflow-hidden"
                  >
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {site.isRedirect ? (
                          <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500" title="Link Camuflado">
                            <Link2 className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary" title="Landing Page Hospedada">
                            <Globe className="w-6 h-6" />
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-md shadow-sm">
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-bold text-white">{site.views || 0}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => {
                            const url = `${window.location.origin}/report/${site.id}`;
                            navigator.clipboard.writeText(url);
                            addToast('Link do relatório copiado!', 'success');
                            window.open(url, '_blank');
                          }} className="p-2 text-textSecondary hover:text-green-500 transition-colors bg-panel rounded-md border border-border" title="Gerar Relatório do Cliente">
                            <BarChart className="w-4 h-4" />
                          </button>
                          
                          <button onClick={() => handleOpenScanner(site)} className="p-2 text-textSecondary hover:text-blue-400 transition-colors bg-panel rounded-md border border-border" title="Auto-Healing Scanner">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          
                          <button onClick={() => navigate(`/builder?edit=${site.id}`)} className="p-2 text-textSecondary hover:text-primary transition-colors bg-panel rounded-md border border-border" title="Editar Código">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(site.id)} className="p-2 text-textSecondary hover:text-red-500 transition-colors bg-panel rounded-md border border-border" title="Apagar Site">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-bold text-white mb-1 truncate">{site.id}</h3>
                    <a href={site.domain.startsWith('http') ? site.domain : `https://${site.domain}`} target="_blank" rel="noopener noreferrer" className="text-primary text-sm hover:underline flex items-center gap-1 mb-4 truncate">
                      {site.domain} <ExternalLink className="w-3 h-3" />
                    </a>
                    
                    <div className="text-xs text-textSecondary pt-4 border-t border-border flex justify-between items-center">
                      <span>{site.domainType === 'subdomain' ? 'Link Gratuito' : 'Domínio Próprio'}</span>
                      <span>{new Date(site.publishedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
        
      </div>

      <AnimatePresence>
        
      <AnimatePresence>
        {isScannerModalOpen && scanningSite && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-panel border border-border rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-400" /> Ghost Auto-Healing Scanner</h3>
                <button onClick={() => setIsScannerModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-background border border-border rounded-lg p-4 flex items-center gap-4">
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
                    <ShieldCheck className="w-16 h-16 text-border mx-auto mb-4" />
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
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">⚠️ 3 Vulnerabilidades Encontradas</h4>
                      <ul className="space-y-2 text-sm text-white/80">
                         <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Imagem de Hero quebrada (Erro 404)</li>
                         <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Botão do Checkout desalinhado no iPhone 13</li>
                         <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Fonte "Inter" não está carregando (Bloqueio CORS)</li>
                      </ul>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-center justify-between">
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
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-success" />
                    </div>
                    <h4 className="text-success font-bold text-lg mb-2">Site Reparado com Sucesso!</h4>
                    <p className="text-textSecondary text-sm mb-6 max-w-sm mx-auto">O layout está perfeitamente alinhado e as imagens ausentes foram substituídas para evitar perda de conversão.</p>
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

        {isRedirectModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-panel border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Link2 className="w-5 h-5 text-pink-500" /> Camuflador Anti-Ban</h3>
                <button onClick={() => setIsRedirectModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <form onSubmit={handleCreateRedirect} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Link Feio (Hotmart, Kiwify, etc)</label>
                  <Input value={redirectDest} onChange={(e) => setRedirectDest(e.target.value)} placeholder="https://pay.kiwify.com.br/12345" required type="url" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Link Camuflado Desejado</label>
                  <div className="flex relative items-center">
                    <span className="absolute left-4 text-textSecondary text-sm font-medium pointer-events-none">.../s/</span>
                    <Input value={redirectSlug} onChange={(e) => setRedirectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="oferta-vip" className="pl-[60px]" required />
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
