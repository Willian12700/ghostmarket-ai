const fs = require('fs');
let content = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// 1. ADD PREDICTIVE CHURN AND GOD-EYE TO MODAL
const oldModalTop = `                  {/* Status Geral */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-background border border-border rounded-xl p-4">
                      <div className="text-textSecondary text-xs mb-1 flex items-center gap-1"><Circle className={\`w-2 h-2 fill-current \${selectedUser.lastLogin && (new Date().getTime() - new Date(selectedUser.lastLogin).getTime() < 15 * 60 * 1000) ? 'text-green-500' : 'text-gray-500'}\`} /> Status</div>
                      <div className="text-white font-bold">\${selectedUser.lastLogin && (new Date().getTime() - new Date(selectedUser.lastLogin).getTime() < 15 * 60 * 1000) ? 'Online Agora' : 'Offline'}</div>
                    </div>`;

const newModalTop = `                  {/* AÇÕES MASTERS */}
                  <div className="flex flex-col gap-2 mb-4">
                    <Button onClick={() => {
                        useAuthStore.getState().setUser({
                          uid: selectedUser.uid || selectedUser.email,
                          email: selectedUser.email,
                          name: selectedUser.name || 'Usuário',
                          photoURL: selectedUser.photoURL || ''
                        });
                        window.location.href = '/';
                      }} 
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]"
                    >
                      <Eye className="w-4 h-4 mr-2" /> Modo God-Eye (Entrar como Cliente)
                    </Button>
                  </div>

                  {/* PREDICTIVE CHURN AI */}
                  {(!selectedUser.lastLogin || (new Date().getTime() - new Date(selectedUser.lastLogin).getTime() > 7 * 24 * 60 * 60 * 1000)) && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col gap-2">
                      <h4 className="text-red-400 font-bold flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> Risco de Churn (Cancelamento)</h4>
                      <p className="text-sm text-red-200">A IA detectou que este usuário não faz login há mais de 7 dias. Grande risco de não renovar a assinatura!</p>
                      <a href={\`https://wa.me/5584996162332?text=Oi \${selectedUser.name}, vi que você não acessa o sistema há um tempo, precisa de ajuda?\`} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 text-white mt-2">
                          <MessageSquare className="w-4 h-4 mr-2" /> Recuperar no WhatsApp
                        </Button>
                      </a>
                    </div>
                  )}

                  {/* Status Geral */}
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="bg-background border border-border rounded-xl p-4">
                      <div className="text-textSecondary text-xs mb-1 flex items-center gap-1"><Circle className={\`w-2 h-2 fill-current \${selectedUser.lastLogin && (new Date().getTime() - new Date(selectedUser.lastLogin).getTime() < 15 * 60 * 1000) ? 'text-green-500' : 'text-gray-500'}\`} /> Status</div>
                      <div className="text-white font-bold">\${selectedUser.lastLogin && (new Date().getTime() - new Date(selectedUser.lastLogin).getTime() < 15 * 60 * 1000) ? 'Online Agora' : 'Offline'}</div>
                    </div>`;

content = content.replace(oldModalTop, newModalTop);

// Import MessageSquare and Eye if needed
if (!content.includes('MessageSquare')) {
  content = content.replace(`import { ShieldAlert, UserCheck`, `import { ShieldAlert, UserCheck, MessageSquare, Eye`);
}

fs.writeFileSync('src/pages/AdminPanel.tsx', content, 'utf8');
