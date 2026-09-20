const fs = require('fs');

let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
content = content.replace(/Apar[^\x00-\x7F]+ncia/g, 'Aparência');
content = content.replace(/v[^\x00-\x7F]+lida/g, 'válida');
content = content.replace(/n[^\x00-\x7F]+o/g, 'não');
content = content.replace(/N[^\x00-\x7F]+o/g, 'Não');
content = content.replace(/Voc[^\x00-\x7F]+/g, 'Você');
content = content.replace(/Configura[^\x00-\x7F]+o/g, 'Configuração');
content = content.replace(/Configura[^\x00-\x7F]+es/g, 'Configurações');
content = content.replace(/prefer[^\x00-\x7F]+ncias/g, 'preferências');
content = content.replace(/Usu[^\x00-\x7F]+rio/g, 'Usuário');
content = content.replace(/Altera[^\x00-\x7F]+es/g, 'Alterações');
content = content.replace(/Padr[^\x00-\x7F]+o/g, 'Padrão');
content = content.replace(/M[^\x00-\x7F]+ximo/g, 'Máximo');
content = content.replace(/Ag[^\x00-\x7F]+ncia/g, 'Agência');
content = content.replace(/Personaliza[^\x00-\x7F]+o/g, 'Personalização');
content = content.replace(/Seguran[^\x00-\x7F]+a/g, 'Segurança');
content = content.replace(/Sess[^\x00-\x7F]+o/g, 'Sessão');
content = content.replace(/Integra[^\x00-\x7F]+es/g, 'Integrações');
content = content.replace(/ser[^\x00-\x7F]+/g, 'será');

fs.writeFileSync('src/pages/Settings.tsx', content, 'utf8');

let sidebar = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
sidebar = sidebar.replace(/Usu[^\x00-\x7F]+rio/g, 'Usuário');
fs.writeFileSync('src/components/layout/Sidebar.tsx', sidebar, 'utf8');

let notifier = fs.readFileSync('src/components/ui/SalesNotifier.tsx', 'utf8');
notifier = notifier.replace(/transa[^\x00-\x7F]+es/g, 'transações');
notifier = notifier.replace(/transa[^\x00-\x7F]+o/g, 'transação');
notifier = notifier.replace(/notifica[^\x00-\x7F]+o/g, 'notificação');
notifier = notifier.replace(/j[^\x00-\x7F]+/g, 'já');
fs.writeFileSync('src/components/ui/SalesNotifier.tsx', notifier, 'utf8');

console.log("Regex replaced!");
