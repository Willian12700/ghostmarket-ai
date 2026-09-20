const fs = require('fs');

let sb = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Add ShieldAlert to lucide-react imports if not there
if (!sb.includes('ShieldAlert')) {
  sb = sb.replace(
    /import {([^}]+)} from 'lucide-react'/,
    "import {$1, ShieldAlert} from 'lucide-react'"
  );
}

// Dynamically push the admin panel group
const menuGroupsCode = `  const menuGroups = [
    {
      label: 'Painel',
      items: [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Painel' }
      ]
    },
    {
      label: 'Prompt, Sites e Leads',
      items: [
        { to: '/creator', icon: Wand2, label: 'Creator IA' },
        { to: '/library', icon: BookMarked, label: 'Biblioteca IA' },
        { to: '/prompt-builder', icon: Code, label: 'Prompt Builder' },
        { to: '/builder', icon: LayoutTemplate, label: 'Hospedar Novo Site' },
        { to: '/sites', icon: Globe, label: 'Meus Sites' },
        { to: '/scanner', icon: Search, label: 'Scanner de Leads' },
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
      label: 'Organização',
      items: [
        { to: '/contracts', icon: FileText, label: 'CRM (Kanban)' },
      ]
    },
    {
      label: 'Sistemas e Integrações',
      items: [
        { to: '/integrations', icon: Settings, label: 'Integrações' },
        { to: '/affiliates', icon: Ghost, label: 'Programa de Afiliados' },
      ]
    },
    {
      label: 'Conta',
      items: [
        { to: '/settings', icon: User, label: 'Meu Perfil' },
      ]
    }
  ]

  if (user?.email === 'willrandrier@gmail.com') {
    menuGroups.push({
      label: 'PAINEL ADM',
      items: [
        { to: '/admin', icon: ShieldAlert, label: 'Liberação de Acesso' }
      ]
    })
  }

  // Automatically expand group if a child is active`;

sb = sb.replace(/const menuGroups = \[\s*\{.*?\]\s*\n\s*\/\/ Automatically expand/s, menuGroupsCode);

fs.writeFileSync('src/components/layout/Sidebar.tsx', sb);
