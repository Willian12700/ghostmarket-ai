const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Ensure MessageCircle is imported
if (!code.includes('MessageCircle')) {
  code = code.replace(/import {([^}]+)} from 'lucide-react'/, (match, p1) => {
    return 'import {' + p1 + ', MessageCircle} from "lucide-react"';
  });
}

// Add the link to the menuGroups
const search = "{ to: '/scanner', icon: Search, label: 'Scanner de Leads' },";
const replace = "{ to: '/scanner', icon: Search, label: 'Scanner de Leads' },\n        { to: '/scripts', icon: MessageCircle, label: 'Scripts X1' },";

if (code.includes(search)) {
  code = code.replace(search, replace);
  fs.writeFileSync('src/components/layout/Sidebar.tsx', code, 'utf8');
  console.log('Fixed sidebar');
} else {
  // If no trailing comma
  const search2 = "{ to: '/scanner', icon: Search, label: 'Scanner de Leads' }";
  const replace2 = "{ to: '/scanner', icon: Search, label: 'Scanner de Leads' },\n        { to: '/scripts', icon: MessageCircle, label: 'Scripts X1' }";
  if (code.includes(search2)) {
    code = code.replace(search2, replace2);
    fs.writeFileSync('src/components/layout/Sidebar.tsx', code, 'utf8');
    console.log('Fixed sidebar');
  } else {
    console.log('Could not find search string');
  }
}
