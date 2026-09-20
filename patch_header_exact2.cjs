const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

const regex = /<div className="space-y-6 max-w-6xl pb-10">\s*<div>\s*<h2 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">\s*<ShieldAlert className="w-8 h-8 text-primary" \/>\s*Painel de Administra[^\x00-\x7F]+o\s*<\/h2>\s*<p className="text-textSecondary mt-2">Vis[^\x00-\x7F]+o geral do SaaS\. Gerencie usu[^\x00-\x7F]+rios e acessos\.<\/p>\s*<\/div>/;

const newHeader = `<div className="space-y-6 max-w-6xl pb-10">
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
      </div>`;

admin = admin.replace(regex, newHeader);

// Fix remaining corrupted characters in the whole file
admin = admin.replace(/usu[^\x00-\x7F]+rios/g, 'usuários');
admin = admin.replace(/Usu[^\x00-\x7F]+rio/g, 'Usuário');
admin = admin.replace(/Gr[^\x00-\x7F]+tis/g, 'Grátis');
admin = admin.replace(/[^\x00-\x7F]+rea [^\x00-\x7F]+ restrita/g, 'área é restrita');
admin = admin.replace(/N[^\x00-\x7F]+o/g, 'Não');
admin = admin.replace(/Conclu[^\x00-\x7F]+do/g, 'Concluído');
admin = admin.replace(/Sess[^\x00-\x7F]+o/g, 'Sessão');

fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
console.log('Fixed Header Regex exactly');
