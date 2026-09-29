const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');
const regex = /\s*const DIGITALIZA_EMAILS[\s\S]*?CRM Compartilhado.*?\n\s*\}\n\s*\}/g;
c = c.replace(regex, '');

const inject = 
  const DIGITALIZA_EMAILS = [
    'oliveiramirandaisaac@gmail.com',
    'josehenrique9373@gmail.com',
    'kaios8252@gmail.com',
    'daviizcl.0003@gmail.com',
    'el6084905@gmail.com',
    'adrianodeoliveiracarneiro13@gmail.com',
    'caioqsilva09@gmail.com',
    'willrandrier@gmail.com'
  ]

  if (user?.email && DIGITALIZA_EMAILS.includes(user.email.toLowerCase())) {
    menuGroups.push({
      label: 'Digitaliza Comercial',
      items: [
        { to: '/digitaliza-crm', icon: Users, label: 'CRM Compartilhado', badge: 'PRO' },
      ]
    })
  }
;

c = c.replace('// Automatically expand group', inject + '\n  // Automatically expand group');
fs.writeFileSync('src/components/layout/Sidebar.tsx', c);
