const fs = require('fs');

let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// 1. Add handleSuspendUser function
const loadUserDetailsCode = `  const loadUserDetails = async (u: any) => {`;
const suspendLogic = `  const handleToggleSuspend = async () => {
    if (!selectedUser) return;
    try {
      const newStatus = !selectedUser.isSuspended;
      await updateDoc(doc(db, 'users', selectedUser.id), { isSuspended: newStatus });
      setSelectedUser({ ...selectedUser, isSuspended: newStatus });
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, isSuspended: newStatus } : u));
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
      addToast(\`Aviso enviado para \${users.length} usuários!\`, 'success');
      setBroadcastTitle('');
      setBroadcastText('');
      setShowBroadcastModal(false);
    } catch(e) {
      console.error(e);
      addToast('Erro ao enviar aviso global.', 'error');
    }
    setIsBroadcasting(false);
  };

  const loadUserDetails = async (u: any) => {`;

if (admin.includes("loadUserDetails = async")) {
  admin = admin.replace(loadUserDetailsCode, suspendLogic);
} else {
  console.log("Not found loadUserDetails");
}


// 2. Add State for broadcast
const statesCode = `  const [loadingDetails, setLoadingDetails] = useState(false)`;
const newStates = `  const [loadingDetails, setLoadingDetails] = useState(false)
  const [showBroadcastModal, setShowBroadcastModal] = useState(false)
  const [broadcastTitle, setBroadcastTitle] = useState('')
  const [broadcastText, setBroadcastText] = useState('')
  const [isBroadcasting, setIsBroadcasting] = useState(false)`;

admin = admin.replace(statesCode, newStates);

// 3. Add imports writeBatch, updateDoc
admin = admin.replace("collection, getDocs, doc, setDoc", "collection, getDocs, doc, setDoc, updateDoc, writeBatch, serverTimestamp");

// 4. In the layout, add the buttons!
const headerSection = `        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Painel Admin</h1>
            <p className="text-textSecondary font-medium">Controle mestre da plataforma GhostMarket AI</p>
          </div>
        </div>`;

const newHeaderSection = `        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Painel Admin</h1>
            <p className="text-textSecondary font-medium">Controle mestre da plataforma GhostMarket AI</p>
          </div>
          <div className="flex gap-4">
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
            <Button onClick={() => setShowBroadcastModal(true)} className="gap-2">
              <Megaphone className="w-4 h-4" />
              Aviso Global
            </Button>
          </div>
        </div>`;

if (admin.includes('mb-8">')) {
  admin = admin.replace(headerSection, newHeaderSection);
}

admin = admin.replace("import { Search, ShieldAlert, Circle, Calendar, X, Globe, LayoutTemplate, Copy } from 'lucide-react'", "import { Search, ShieldAlert, Circle, Calendar, X, Globe, LayoutTemplate, Copy, Megaphone, AlertOctagon } from 'lucide-react'");

// 5. Add Suspend button in the sidebar panel
const suspendButtonCode = `                  <div className="bg-background border border-border rounded-xl p-4">
                      <div className="text-textSecondary text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fim do Plano</div>
                      <div className="text-white font-bold text-sm truncate">{selectedUser.plan === 'vitalicio' ? 'Vitalício' : (selectedUser.isAllowed ? 'Mensal (Ativo)' : 'Sem Plano')}</div>
                    </div>
                  </div>`;

const newSuspendButtonCode = `                  <div className="bg-background border border-border rounded-xl p-4">
                      <div className="text-textSecondary text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fim do Plano</div>
                      <div className="text-white font-bold text-sm truncate">{selectedUser.plan === 'vitalicio' ? 'Vitalício' : (selectedUser.isAllowed ? 'Mensal (Ativo)' : 'Sem Plano')}</div>
                    </div>
                  </div>

                  <Button 
                    variant={selectedUser.isSuspended ? "default" : "destructive"} 
                    className="w-full gap-2 font-bold" 
                    onClick={handleToggleSuspend}
                  >
                    <AlertOctagon className="w-4 h-4" />
                    {selectedUser.isSuspended ? 'Restaurar Acesso' : 'Suspender Acesso'}
                  </Button>`;

admin = admin.replace(suspendButtonCode, newSuspendButtonCode);

// 6. Add Broadcast Modal
const mainEnd = `      </div>
    </div>
  )`;

const modalHtml = `
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
`;

admin = admin.replace(mainEnd, modalHtml + mainEnd);

fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
console.log('Patched AdminPanel!');
