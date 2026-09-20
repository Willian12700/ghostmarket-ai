import { Megaphone, AlertOctagon } from 'lucide-react';
import { useState, useEffect } from 'react'
import { collection, doc, setDoc, getDocs, query, where, writeBatch, serverTimestamp } from 'firebase/firestore'
import { db } from '@/config/firebase'
import { useAuthStore } from '@/store/authStore'
import { useToastStore } from '@/store/toastStore'
import { ShieldAlert, UserCheck, Search, Users, Circle, Calendar, DollarSign, Globe, X, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { NicheManager } from '@/components/admin/NicheManager'
import { motion, AnimatePresence } from 'framer-motion'

export const AdminPanel = () => {
  const { user } = useAuthStore()
  const { addToast } = useToastStore()
  
  const [freeAccessEmail, setFreeAccessEmail] = useState('')
  const [isGrantingAccess, setIsGrantingAccess] = useState(false)

  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(true)

  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [userSites, setUserSites] = useState<any[]>([])
  const [userDashboardValue, setUserDashboardValue] = useState(0)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastText, setBroadcastText] = useState('')
  const [isBroadcasting, setIsBroadcasting] = useState(false)

  useEffect(() => {
    if (user?.email !== 'willrandrier@gmail.com') return

    const fetchUsers = async () => {
      try {
        const usersMap = new Map()

        const allowedSnap = await getDocs(collection(db, 'allowed_users'))
        allowedSnap.forEach(doc => {
          const data = doc.data()
          const email = doc.id.toLowerCase()
          usersMap.set(email, { ...data, email, isAllowed: true, docId: doc.id })
        })

        const usersSnap = await getDocs(collection(db, 'users'))
        usersSnap.forEach(doc => {
          const data = doc.data()
          const email = (data.email || doc.id).toLowerCase()
          if (usersMap.has(email)) {
            usersMap.set(email, { ...usersMap.get(email), ...data })
          } else {
            usersMap.set(email, { ...data, email, isAllowed: false, docId: doc.id })
          }
        })

        setUsers(Array.from(usersMap.values()).sort((a, b) => {
          const dateA = a.lastLogin || a.grantedAt || ''
          const dateB = b.lastLogin || b.grantedAt || ''
          return dateB.localeCompare(dateA)
        }))
      } catch (err) {
        console.error('Error fetching users', err)
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [user])

  const handleToggleSuspend = async () => {
    if (!selectedUser) return;
    try {
      const newStatus = !selectedUser.isSuspended;
      await setDoc(doc(db, 'users', selectedUser.email), { isSuspended: newStatus }, { merge: true });
      setSelectedUser({ ...selectedUser, isSuspended: newStatus });
      setUsers(users.map(u => u.email === selectedUser.email ? { ...u, isSuspended: newStatus } : u));
      addToast(newStatus ? 'Acesso suspenso com sucesso.' : 'Acesso restaurado.', 'success');
    } catch (e) {
      console.error(e);
      addToast('Erro ao suspender acesso.', 'error');
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastTitle || !broadcastText) return;
    setIsBroadcasting(true);
    try {
      const batch = writeBatch(db);
      users.forEach(u => {
        const notifRef = doc(collection(db, 'notifications'));
        batch.set(notifRef, {
          userId: u.email,
          title: broadcastTitle,
          text: broadcastText,
          unread: true,
          createdAt: serverTimestamp()
        });
      });
      await batch.commit();
      addToast(`Aviso enviado para ${users.length} usuários!`, 'success');
      setBroadcastTitle('');
      setBroadcastText('');
      setShowBroadcastModal(false);
    } catch(e) {
      console.error(e);
      addToast('Erro ao enviar aviso global.', 'error');
    }
    setIsBroadcasting(false);
  };

  const loadUserDetails = async (u: any) => {
    setSelectedUser(u)
    setLoadingDetails(true)
    setUserSites([])
    setUserDashboardValue(0)

    try {
      const email = u.email
      const uid = u.uid
      const queryIds = uid && uid !== email ? [email, uid] : [email]

      const sitesQuery = query(collection(db, 'sites'), where('userId', 'in', queryIds))
      const sitesSnap = await getDocs(sitesQuery)
      const sites: any[] = []
      sitesSnap.forEach(doc => sites.push({ id: doc.id, ...doc.data() }))
      setUserSites(sites)

      let totalValue = 0

      const txsQuery = query(collection(db, 'transactions'), where('userId', 'in', queryIds))
      const txsSnap = await getDocs(txsQuery)
      txsSnap.forEach(doc => {
        const t = doc.data()
        const s = (t.status || '').toLowerCase().trim()
        if (s === 'aprovado' || s === 'paid' || s === 'approved' || s === 'fechado') {
          totalValue += (Number(t.amount) || 0)
        }
      })

      const crmQuery = query(collection(db, 'crm_contracts'), where('userId', 'in', queryIds))
      const crmSnap = await getDocs(crmQuery)
      crmSnap.forEach(doc => {
        const c = doc.data()
        const s = (c.status || '').toLowerCase()
        if (s === 'fechado' || s === 'aprovado') {
          totalValue += (Number(c.value) || 0)
        }
      })

      setUserDashboardValue(totalValue)
    } catch (error) {
      console.error('Error loading details', error)
    } finally {
      setLoadingDetails(false)
    }
  }

  if (user?.email !== 'willrandrier@gmail.com') {
    return <div className="text-white p-8">Acesso Negado. Esta área é restrita ao Administrador.</div>
  }

  const handleGrantFreeAccess = async () => {
    if (!freeAccessEmail.trim()) {
      addToast('Digite o email do usuário', 'error')
      return
    }

    setIsGrantingAccess(true)
    const emailToGrant = freeAccessEmail.toLowerCase().trim()
    try {
      await setDoc(doc(db, 'allowed_users', emailToGrant), {
        email: emailToGrant,
        status: 'approved',
        plan: 'vitalicio',
        grantedByAdmin: true,
        grantedAt: new Date().toISOString()
      }, { merge: true })
      
      // Update UI optimistically
      setUsers(prev => {
        const existing = prev.find(u => u.email === emailToGrant)
        if (existing) {
          return prev.map(u => u.email === emailToGrant ? { ...u, isAllowed: true, plan: 'vitalicio' } : u)
        } else {
          return [{ email: emailToGrant, name: 'Desconhecido', isAllowed: true, plan: 'vitalicio' }, ...prev]
        }
      })
      
      addToast(`Acesso Vitalício liberado para ${freeAccessEmail}!`, 'success')
      setFreeAccessEmail('')
    } catch (error) {
      console.error(error)
      addToast('Erro ao liberar acesso.', 'error')
    } finally {
      setIsGrantingAccess(false)
    }
  }

  const filteredUsers = users.filter(u => u.email.includes(search.toLowerCase()) || (u.name && u.name.toLowerCase().includes(search.toLowerCase())))

  return (
    <div className="space-y-6 max-w-6xl pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Painel de Administração
          </h2>
          <p className="text-textSecondary mt-2">Visão geral do SaaS. Gerencie usuários e acessos.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="bg-panel border border-border rounded-xl px-4 py-2 flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-textSecondary font-bold">ONLINE AGORA (1h)</span>
              <span className="text-white font-extrabold text-lg leading-none">{users.filter(u => new Date().getTime() - new Date(u.lastLogin || 0).getTime() < 60 * 60 * 1000).length}</span>
            </div>
          </div>
          <Button onClick={() => setShowBroadcastModal(true)} className="gap-2 h-auto flex-1 sm:flex-none justify-center">
            <Megaphone className="w-4 h-4" />
            Aviso Global
          </Button>
        </div>
      </div>

      <Card className="border-primary/50 shadow-[0_0_20px_rgba(139,92,246,0.15)] bg-gradient-to-br from-panel to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <UserCheck className="w-5 h-5" />
            Liberar Acesso (VIP / Grátis)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-textSecondary">
              Insira o email de um usuário para liberar acesso total à plataforma GhostMarket sem necessidade de assinatura.
            </p>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Input 
                  label="E-mail do Usuário" 
                  placeholder="email@exemplo.com"
                  value={freeAccessEmail}
                  onChange={(e) => setFreeAccessEmail(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleGrantFreeAccess}
                disabled={isGrantingAccess || !freeAccessEmail}
                className="w-48 bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"
              >
                {isGrantingAccess ? 'Liberando...' : 'Liberar Acesso VIP'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

        <NicheManager />

      <Card className="border-border bg-panel">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Gestão de Usuários
            </div>
            <div className="relative w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-textSecondary" />
              <Input 
                placeholder="Pesquisar por email ou nome..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-background h-10"
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-background text-textSecondary font-medium">
                <tr>
                  <th className="px-6 py-4">Usuário</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Último Acesso</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingUsers ? (
                  <tr><td colSpan={4} className="text-center py-8">Carregando usuários...</td></tr>
                ) : filteredUsers.length === 0 ? (
                  <tr><td colSpan={4} className="text-center py-8">Nenhum usuário encontrado.</td></tr>
                ) : (
                  filteredUsers.map((u, i) => {
                    const isOnline = u.lastLogin && (new Date().getTime() - new Date(u.lastLogin).getTime() < 15 * 60 * 1000)
                    return (
                      <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.photoURL ? (
                              <img src={u.photoURL} alt={u.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                                {u.name?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white">{u.name || 'Sem Nome'}</div>
                              <div className="text-textSecondary text-xs">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {u.isAllowed ? (
                            <span className="px-2 py-1 bg-green-500/10 text-green-500 rounded-md text-xs font-medium border border-green-500/20">Ativo (Pago/VIP)</span>
                          ) : (
                            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-md text-xs font-medium border border-yellow-500/20">Gratuito</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Circle className={`w-2 h-2 fill-current ${isOnline ? 'text-green-500' : 'text-gray-500'}`} />
                            {u.lastLogin ? new Date(u.lastLogin).toLocaleString('pt-BR') : 'Nunca'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button size="sm" variant="secondary" onClick={() => loadUserDetails(u)}>Ver Detalhes</Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-panel h-full shadow-2xl border-l border-border flex flex-col"
            >
              <div className="h-20 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/50">
                <div className="flex items-center gap-3">
                  {selectedUser.photoURL ? (
                    <img src={selectedUser.photoURL} alt={selectedUser.name} className="w-10 h-10 rounded-full object-cover border border-white/10" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                      {selectedUser.name?.charAt(0).toUpperCase() || selectedUser.email?.charAt(0).toUpperCase() || '?'}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-white leading-tight">{selectedUser.name || 'Usuário'}</h3>
                    <p className="text-xs text-textSecondary">{selectedUser.email}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(null)} className="text-textSecondary hover:text-white p-2">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                
                {/* Status Geral */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-background border border-border rounded-xl p-4">
                    <div className="text-textSecondary text-xs mb-1 flex items-center gap-1"><Circle className={`w-2 h-2 fill-current ${selectedUser.lastLogin && (new Date().getTime() - new Date(selectedUser.lastLogin).getTime() < 15 * 60 * 1000) ? 'text-green-500' : 'text-gray-500'}`} /> Status</div>
                    <div className="text-white font-bold">{selectedUser.lastLogin && (new Date().getTime() - new Date(selectedUser.lastLogin).getTime() < 15 * 60 * 1000) ? 'Online Agora' : 'Offline'}</div>
                  </div>
                  <div className="bg-background border border-border rounded-xl p-4">
                    <div className="text-textSecondary text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fim do Plano</div>
                    <div className="text-white font-bold text-sm truncate">{selectedUser.plan === 'vitalicio' ? 'Vitalício' : (selectedUser.isAllowed ? 'Mensal (Ativo)' : 'Sem Plano')}</div>
                  </div>
                </div>

                <Button 
                  variant={selectedUser.isSuspended ? "secondary" : "danger"} 
                  className="w-full gap-2 font-bold" 
                  onClick={handleToggleSuspend}
                >
                  <AlertOctagon className="w-4 h-4" />
                  {selectedUser.isSuspended ? 'Restaurar Acesso' : 'Suspender Acesso'}
                </Button>

                {/* Saldo Financeiro */}
                <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6 relative overflow-hidden">
                  <DollarSign className="absolute -right-4 -bottom-4 w-24 h-24 text-green-500/10" />
                  <div className="text-green-400 text-sm font-medium mb-1 relative z-10">Faturamento no Dashboard</div>
                  <div className="text-3xl font-bold text-white relative z-10">
                    {loadingDetails ? '...' : `R$ ${userDashboardValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                  </div>
                </div>

                {/* Sites Produzidos */}
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                    <Globe className="w-5 h-5 text-primary" /> Sites Hospedados ({userSites.length})
                  </h4>
                  {loadingDetails ? (
                    <div className="text-center text-textSecondary py-4">Carregando sites...</div>
                  ) : userSites.length === 0 ? (
                    <div className="text-center text-textSecondary py-4 bg-background border border-border rounded-xl text-sm">Este usuário não hospedou nenhum site ainda.</div>
                  ) : (
                    <div className="space-y-3">
                      {userSites.map(site => (
                        <div key={site.id} className="bg-background border border-border rounded-xl p-4 flex items-center justify-between group">
                          <div className="overflow-hidden">
                            <div className="text-white font-medium truncate">{site.id}</div>
                            <div className="text-xs text-textSecondary mt-1">{site.views || 0} acessos totais</div>
                          </div>
                          <a 
                            href={site.domain} 
                            target="_blank" 
                            rel="noreferrer"
                            className="p-2 text-textSecondary hover:text-primary bg-panel rounded-lg transition-colors shrink-0 ml-2"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowBroadcastModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-panel border border-border rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
                <Megaphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Aviso Global</h3>
                <p className="text-sm text-textSecondary">Todos os usuários vão receber</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-textSecondary mb-1 block">Título</label>
                <Input 
                  placeholder="Ex: Nova Atualização!" 
                  value={broadcastTitle} 
                  onChange={e => setBroadcastTitle(e.target.value)} 
                />
              </div>
              <div>
                <label className="text-sm font-medium text-textSecondary mb-1 block">Mensagem</label>
                <textarea 
                  className="w-full bg-background border border-border rounded-lg p-3 text-white text-sm focus:border-primary focus:outline-none min-h-[100px]"
                  placeholder="Digite o aviso que aparecerá para os clientes..."
                  value={broadcastText}
                  onChange={e => setBroadcastText(e.target.value)}
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button variant="secondary" className="flex-1" onClick={() => setShowBroadcastModal(false)}>Cancelar</Button>
                <Button className="flex-1 gap-2" onClick={handleBroadcast} disabled={isBroadcasting || !broadcastTitle || !broadcastText}>
                  {isBroadcasting ? 'Enviando...' : 'Disparar Aviso'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
</div>
  )
}
