const fs = require('fs');
const path = require('path');

const dir = 'src';

function replaceBadChars(str) {
  return str
    .replace(/Ã¡/g, 'á')
    .replace(/Ãº/g, 'ú')
    .replace(/Ãª/g, 'ê')
    .replace(/Ã£/g, 'ã')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã§/g, 'ç')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/vǭlida/g, 'válida')
    .replace(/AparǦncia/g, 'Aparência')
    .replace(/nǜo/g, 'não')
    .replace(/VocǦ/g, 'Você')
    .replace(/Configuraǜo/g, 'Configuração')
    .replace(/Configuraes/g, 'Configurações')
    .replace(/preferǦncias/g, 'preferências')
    .replace(/Usuǭrio/g, 'Usuário')
    .replace(/Alteraes/g, 'Alterações')
    .replace(/Visvel/g, 'Visível')
    .replace(/Padrǜo/g, 'Padrão')
    .replace(/Mǭximo/g, 'Máximo')
    .replace(/AgǦncia/g, 'Agência')
    .replace(/Personalizaǜo/g, 'Personalização')
    .replace(/Segurana/g, 'Segurança')
    .replace(/Sessǜo/g, 'Sessão')
    .replace(/segurana/g, 'segurança')
    .replace(/Integraes/g, 'Integrações')
    .replace(/Nǜo/g, 'Não')
    .replace(/serǭ/g, 'será')
    .replace(/diǟrio/g, 'diário')
    .replace(/diǟrio/g, 'diário')
    .replace(/ǟltimos/g, 'últimos')
    .replace(/ǟltimos/g, 'últimos')
    .replace(/Mǟs/g, 'Mês')
    .replace(/Mǟs/g, 'Mês')
    .replace(/Visǟo/g, 'Visão')
    .replace(/Visǟo/g, 'Visão')
    .replace(/negǟcio/g, 'negócio')
    .replace(/negǟcio/g, 'negócio')
    .replace(/Notificaǟǟes/g, 'Notificações')
    .replace(/Notificaǟǟes/g, 'Notificações')
    .replace(/jǭ/g, 'já')
    .replace(/transaes/g, 'transações')
    .replace(/transaǜo/g, 'transação')
    .replace(/notificaǜo/g, 'notificação')
    .replace(/Usu\?'rio/g, 'Usuário')
    .replace(/Usu\?'rio/g, 'Usuário');
}

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      const fixed = replaceBadChars(content);
      if (content !== fixed) {
        fs.writeFileSync(fullPath, fixed, 'utf8');
        console.log("Fixed: " + fullPath);
      }
    }
  }
}

walk(dir);
