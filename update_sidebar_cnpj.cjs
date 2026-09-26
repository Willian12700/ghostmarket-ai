const fs = require('fs');

let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Ensure SearchCode is imported
if (!code.includes('SearchCode')) {
  code = code.replace(
    "import { LayoutDashboard, BellRing, Trophy, Wand2, Search, FileText, Bot, Settings, LogOut, Ghost, X, Code, User, BookMarked, Users, Video, TrendingUp, Mail, Megaphone, BookOpen, LayoutTemplate, Globe, Image as ImageIcon, ShieldAlert, MessageCircle } from 'lucide-react'",
    "import { LayoutDashboard, BellRing, Trophy, Wand2, Search, FileText, Bot, Settings, LogOut, Ghost, X, Code, User, BookMarked, Users, Video, TrendingUp, Mail, Megaphone, BookOpen, LayoutTemplate, Globe, Image as ImageIcon, ShieldAlert, MessageCircle, SearchCode } from 'lucide-react'"
  );
}

// Add the menu item
if (!code.includes('/cnpj')) {
  code = code.replace(
    "{ to: '/scanner', icon: Search, label: 'Scanner de Leads' },",
    "{ to: '/scanner', icon: Search, label: 'Scanner de Leads' },\n        { to: '/cnpj', icon: SearchCode, label: 'Dossiê CNPJ' },"
  );
  fs.writeFileSync('src/components/layout/Sidebar.tsx', code, 'utf8');
}
