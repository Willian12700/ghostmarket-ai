const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// Fix text
admin = admin.replace(/Administra[^\x00-\x7F]+o/g, 'Administração');
admin = admin.replace(/Vis[^\x00-\x7F]+o geral/g, 'Visão geral');
admin = admin.replace(/usu[^\x00-\x7F]+rios/g, 'usuários');
admin = admin.replace(/[^\x00-\x7F]+rea [^\x00-\x7F]+ restrita/g, 'área é restrita');

// Add header layout
const oldHeader = `<div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Painel de Administração
          </h2>
          <p className="text-textSecondary mt-2">Visão geral do SaaS. Gerencie usuários e acessos.</p>
        </div>
      </div>`;

const newHeader = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-primary" />
            Painel de Administração
          </h2>
          <p className="text-textSecondary mt-2">Visão geral do SaaS. Gerencie usuários e acessos.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
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
          <Button onClick={() => setShowBroadcastModal(true)} className="gap-2 h-auto">
            <Megaphone className="w-4 h-4" />
            Aviso Global
          </Button>
        </div>
      </div>`;

admin = admin.replace(/<div className="flex justify-between items-center mb-8">[\s\S]*?<\/div>\s*<\/div>/, newHeader);

fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
console.log('Fixed header');
