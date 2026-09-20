const fs = require('fs');
let admin = fs.readFileSync('src/pages/AdminPanel.tsx', 'utf8');

// Since there are weird chars, let's just find the div
const h2Index = admin.indexOf('<ShieldAlert className="w-8 h-8 text-primary" />');
const divStart = admin.lastIndexOf('<div className="flex justify-between', h2Index);
const divEnd = admin.indexOf('</Card>', h2Index); // The next thing is a Card

if (divStart !== -1 && divEnd !== -1) {
  // Find the closing div of the header wrapper
  const headerEnd = admin.lastIndexOf('</div>', divEnd - 20) + 6;
  
  const newHeader = `<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
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
  
  admin = admin.substring(0, divStart) + newHeader + admin.substring(headerEnd);
  
  // also fix the weird characters globally in AdminPanel
  admin = admin.replace(/usu[^\x00-\x7F]+rios/g, 'usuários');
  admin = admin.replace(/Usu[^\x00-\x7F]+rio/g, 'Usuário');
  admin = admin.replace(/Gr[^\x00-\x7F]+tis/g, 'Grátis');
  admin = admin.replace(/[^\x00-\x7F]+rea [^\x00-\x7F]+ restrita/g, 'área é restrita');
  admin = admin.replace(/N[^\x00-\x7F]+o/g, 'Não');
  admin = admin.replace(/Conclu[^\x00-\x7F]+do/g, 'Concluído');
  admin = admin.replace(/Sess[^\x00-\x7F]+o/g, 'Sessão');
  admin = admin.replace(/S[^\x00-\x7F]+o/g, 'São');
  
  fs.writeFileSync('src/pages/AdminPanel.tsx', admin, 'utf8');
  console.log('Fixed Header exactly');
} else {
  console.log('Not found');
}
