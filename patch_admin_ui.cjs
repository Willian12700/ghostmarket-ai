const fs = require('fs');

let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// fix imports
admin = admin.replace(
  "import { collection, doc, setDoc, getDocs, query, where } from 'firebase/firestore'", 
  "import { collection, doc, setDoc, getDocs, query, where, updateDoc, writeBatch, serverTimestamp } from 'firebase/firestore'"
);

// fix JSX UI Header
const headerStartIdx = admin.indexOf('<div className="flex justify-between items-end mb-8">');
const headerEndIdx = admin.indexOf('</div>', admin.indexOf('Controle mestre da plataforma GhostMarket AI')) + '</div>'.length;

if (headerStartIdx !== -1) {
  const newHeader = `<div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
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
  admin = admin.substring(0, headerStartIdx) + newHeader + admin.substring(headerEndIdx);
} else {
  console.log("Could not find header");
}

// Fix Suspend Button
const suspendTarget = `<div className="bg-background border border-border rounded-xl p-4">
                    <div className="text-textSecondary text-xs mb-1 flex items-center gap-1"><Calendar className="w-3 h-3" /> Fim do Plano</div>
                    <div className="text-white font-bold text-sm truncate">{selectedUser.plan === 'vitalicio' ? 'Vitalício' : (selectedUser.isAllowed ? 'Mensal (Ativo)' : 'Sem Plano')}</div>
                  </div>
                </div>`;

const newSuspend = `<div className="bg-background border border-border rounded-xl p-4">
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

const suspendIdx = admin.indexOf('<div className="bg-background border border-border rounded-xl p-4">\r\n                      <div className="text-textSecondary text-xs mb-1 flex items-center gap-1"><Calendar');
if (suspendIdx !== -1) {
  // It's tricky to replace string with varying whitespaces, let's use regex
  admin = admin.replace(/<div className="bg-background border border-border rounded-xl p-4">[\s\S]*?<div className="text-white font-bold text-sm truncate">\{selectedUser\.plan[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/, newSuspend);
}

// Fix Modal
const mainEndIdx = admin.lastIndexOf('</div>\r\n    </div>\r\n  )');
if (mainEndIdx !== -1) {
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
  admin = admin.substring(0, mainEndIdx) + modalHtml + admin.substring(mainEndIdx);
}

fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
console.log("Patched UI!");
