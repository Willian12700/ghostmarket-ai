import { useState, useEffect } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { Globe, Trash2, Edit, ExternalLink, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from '@/components/ui/Input'

type Site = {
  id: string;
  domain: string;
  publishedAt: string;
  domainType: string;
}

export const HostedSites = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  const navigate = useNavigate()
  
  const [sites, setSites] = useState<Site[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
          <Button onClick={() => navigate('/builder')} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <Plus className="w-4 h-4 mr-2" /> Hospedar Novo Site
          </Button>
        </div>

        <div className="bg-panel rounded-2xl border border-border p-6 shadow-xl">
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
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div className="flex gap-2">
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
    </div>
  )
}
