const fs = require('fs');
let c = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf-8');

// Strip old dynamic pushes
c = c.replace(/if \(user\?\.email === 'willrandrier@gmail\.com'\) \{[\s\S]*?\]\s*\}\)\s*\}/, '');
c = c.replace(/const DIGITALIZA_EMAILS = \[\s*[\s\S]*?badge: 'PRO' \},\s*\]\s*\}\)\s*\}/, '');

// Strip the declaration of menuGroups
c = c.replace(/const menuGroups = \[[\s\S]*?label: 'CRM \(Kanban\)' \},\s*\]\s*\}/, '');

// Add the robust declaration
const robustMenuGroups = 
  const uEmail = user?.email ? user.email.trim().toLowerCase() : ''
  const hasAdminAccess = uEmail === 'willrandrier@gmail.com'
  
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
  const hasDigitalizaAccess = uEmail && DIGITALIZA_EMAILS.includes(uEmail)

  const menuGroups = [
    {
      label: 'Painel',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Resumo Global' },
        { to: '/ranking', icon: Trophy, label: 'Top Global' }
      ]
    },
    {
      label: 'Inteligência de Mercado',
      items: [
        { to: '/offers', icon: BellRing, label: 'Tracker de Ofertas' }
      ]
    },
    {
      label: 'Prompt, Sites e Leads',
      items: [
        { to: '/creator', icon: Wand2, label: 'Creator IA' },
        { to: '/library', icon: BookMarked, label: 'Biblioteca IA' },
        { to: '/prompt-builder', icon: Code, label: 'Prompt Builder' },
        { to: '/builder', icon: LayoutTemplate, label: 'Hospedar Novo Site' },
        { to: '/ide', icon: Code, label: 'Ghost IDE (BETA)', badge: 'NOVO' },
        { to: '/image-to-link', icon: ImageIcon, label: 'Converter Imagem (URL)' },
        { to: '/sites', icon: Globe, label: 'Meus Sites' },
        { to: '/chatbots', icon: Bot, label: 'Chatbots de IA' },
        { to: '/scanner', icon: Search, label: 'Scanner de Leads' },
        { to: '/cnpj', icon: SearchCode, label: 'Dossiê CNPJ' },
        { to: '/scripts', icon: MessageCircle, label: 'Scripts X1' },
      ]
    },
    {
      label: 'TikTok Shop',
      items: [
        { to: '/tiktok/persona', icon: Users, label: 'Gerador de Persona' },
        { to: '/tiktok/persona-history', icon: BookMarked, label: 'Histórico de Persona' },
        { to: '/tiktok/scripts', icon: Video, label: 'Roteiros Virais' },
        { to: '/tiktok/ads', icon: TrendingUp, label: 'Copy para Anúncios' }
      ]
    },
    {
      label: 'Marketing Digital',
      items: [
        { to: '/marketing/vsl', icon: Video, label: 'Fábrica de VSLs' },
        { to: '/marketing/plr', icon: BookOpen, label: 'Máquina de PLR / E-books' },
        { to: '/marketing/ads', icon: Megaphone, label: 'Gerador de Anúncios' },
        { to: '/marketing/emails', icon: Mail, label: 'Funil de E-mail' }
      ]
    },
    {
      label: 'Gestão',
      items: [
        { to: '/contracts', icon: FileText, label: 'CRM (Kanban)' },
      ]
    },
    ...(hasDigitalizaAccess ? [{
      label: 'Digitaliza Comercial',
      items: [
        { to: '/digitaliza-crm', icon: Users, label: 'CRM Compartilhado', badge: 'PRO' }
      ]
    }] : []),
    ...(hasAdminAccess ? [{
      label: 'PAINEL ADM',
      items: [
        { to: '/admin', icon: ShieldAlert, label: 'Liberação de Acesso' }
      ]
    }] : [])
  ]
;

c = c.replace('  // Automatically expand group if a child is active', robustMenuGroups + '\n\n  // Automatically expand group if a child is active');

fs.writeFileSync('src/components/layout/Sidebar.tsx', c);
