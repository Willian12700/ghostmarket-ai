const fs = require('fs');
let s = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

const target = "{ to: '/tiktok/ads', icon: TrendingUp, label: 'Copy para Anúncios' }";
const replacement = target + `
        ]
      },
      {
        label: 'Marketing Digital',
        items: [
          { to: '/marketing/vsl', icon: Video, label: 'Fábrica de VSLs' },
          { to: '/marketing/plr', icon: BookOpen, label: 'Máquina de PLR / E-books' },
          { to: '/marketing/ads', icon: Megaphone, label: 'Gerador de Anúncios' },
          { to: '/marketing/emails', icon: Mail, label: 'Funil de E-mail' }`;
          
s = s.replace(target, replacement);
fs.writeFileSync('src/components/layout/Sidebar.tsx', s, 'utf8');
