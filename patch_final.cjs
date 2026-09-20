const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// Fix Button variants and import
admin = admin.replace('variant={selectedUser.isSuspended ? "default" : "destructive"}', 'variant={selectedUser.isSuspended ? "secondary" : "danger"}');
admin = admin.replace("import { Search, ShieldAlert, Circle, Calendar, X, Globe, LayoutTemplate, Copy, Megaphone } from 'lucide-react'", "import { Search, ShieldAlert, Circle, Calendar, X, Globe, LayoutTemplate, Copy, Megaphone, AlertOctagon } from 'lucide-react'");
admin = admin.replace("import { Search, ShieldAlert, Circle, Calendar, X, Globe, LayoutTemplate, Copy } from 'lucide-react'", "import { Search, ShieldAlert, Circle, Calendar, X, Globe, LayoutTemplate, Copy, Megaphone, AlertOctagon } from 'lucide-react'");

// Force append modal before last div
const lastDivIdx = admin.lastIndexOf('</div>');
if (lastDivIdx !== -1) {
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
  admin = admin.substring(0, lastDivIdx) + modalHtml + admin.substring(lastDivIdx);
}

fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
console.log('Final patch');
