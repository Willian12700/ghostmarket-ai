const fs = require('fs');
const path = require('path');

function walk(dir) {
  let count = 0;
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      count += walk(file);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(file, 'utf8');
      
      const regexReplacements = [
        { r: /voc\uFFFD/gi, t: 'você' },
        { r: /Voc\uFFFD/g, t: 'Você' },
        { r: /Fantǭstico/g, t: 'Fantástico' },
        { r: /ǭrea/g, t: 'área' },
        { r: / Ǹ /g, t: ' é ' },
        { r: /Administra\uFFFDǜo/g, t: 'Administração' },
        { r: /Visǜo/g, t: 'Visão' },
        { r: /usuǭrios/g, t: 'usuários' },
        { r: /vǜo/g, t: 'vão' },
        { r: /aparecerǭ/g, t: 'aparecerá' },
        { r: /Come\uFFFDar/g, t: 'Começar' },
        { r: /Vital\uFFFDcio/g, t: 'Vitalício' },
        { r: /Vitalcio/g, t: 'Vitalício' },
        { r: /Incio/g, t: 'Início' },
        { r: /c\uFFFDdigo/g, t: 'código' },
        { r: /d\uFFFDgitos/g, t: 'dígitos' },
        { r: /avalia\uFFFDǜo/g, t: 'avaliação' },
        { r: /Grǭtis/g, t: 'Grátis' },
        { r: /In\uFFFDcio/g, t: 'Início' },
        { r: /op\uFFFD\uFFFDes/g, t: 'opções' },
        { r: /Avan\uFFFDado/g, t: 'Avançado' },
        { r: /Configura\uFFFD\uFFFDes/g, t: 'Configurações' },
        { r: /A\uFFFD\uFFFDo/g, t: 'Ação' },
        { r: /Integra\uFFFD\uFFFDes/g, t: 'Integrações' },
        { r: /Automa\uFFFD\uFFFDo/g, t: 'Automação' },
        { r: /Solu\uFFFD\uFFFDes/g, t: 'Soluções' },
        { r: /P\uFFFDgina/g, t: 'Página' },
        { r: /N\uFFFDo/g, t: 'Não' },
        { r: /Nǜo/g, t: 'Não' },
        { r: /nǜo/g, t: 'não' },
        { r: /n\uFFFDo/g, t: 'não' },
        { r: /Saa\uFFFD/g, t: 'SaaS' },
        { r: /Gest\uFFFDo/g, t: 'Gestão' },
        { r: /convers\uFFFDo/g, t: 'conversão' },
        { r: /conclu\uFFFDdo/g, t: 'concluído' },
        { r: /Padr\uFFFDo/g, t: 'Padrão' },
        { r: /Exclui\uFFFD\uFFFD/g, t: 'Exclusão' },
        { r: /p\uFFFDfego/g, t: 'tráfego' },
        { r: /tr\uFFFDfego/g, t: 'tráfego' },
        { r: /estrat\uFFFDgia/g, t: 'estratégia' },
        { r: /autom\uFFFDtico/g, t: 'automático' },
        { r: /Autom\uFFFDtico/g, t: 'Automático' },
        { r: /m\uFFFDtricas/g, t: 'métricas' },
        { r: /intelig\uFFFDncia/g, t: 'inteligência' },
        { r: /pr\uFFFDximo/g, t: 'próximo' },
        { r: /r\uFFFDpido/g, t: 'rápido' },
        { r: /r\uFFFDpida/g, t: 'rápida' },
        { r: /v\uFFFDdeo/g, t: 'vídeo' },
        { r: /v\uFFFDdeos/g, t: 'vídeos' },
        { r: /conte\uFFFDdo/g, t: 'conteúdo' },
        { r: /lucrat\uFFFDvel/g, t: 'lucrativo' },
        { r: /vis\uFFFDo/g, t: 'visão' },
        { r: /f\uFFFDcil/g, t: 'fácil' },
        { r: /at\uFFFD/g, t: 'até' },
        { r: /j\uFFFD/g, t: 'já' },
        { r: /\uFFFDnico/g, t: 'único' },
        { r: /\uFFFDnica/g, t: 'única' },
        { r: /d\uFFFDvida/g, t: 'dúvida' },
        { r: /al\uFFFDm/g, t: 'além' },
        { r: /algu\uFFFDm/g, t: 'alguém' },
        { r: /por\uFFFDm/g, t: 'porém' },
        { r: /tamb\uFFFDm/g, t: 'também' },
        { r: /m\uFFFDs/g, t: 'mês' },
        { r: /tr\uFFFDs/g, t: 'três' },
        { r: /b\uFFFDnus/g, t: 'bônus' },
        { r: /s\uFFFDo/g, t: 'são' },
        { r: /cora\uFFFD\uFFFDo/g, t: 'coração' },
        { r: /bot\uFFFDo/g, t: 'botão' },
        { r: /fun\uFFFD\uFFFDo/g, t: 'função' },
        { r: /a\uFFFD\uFFFDo/g, t: 'ação' },
        { r: /A\uFFFD\uFFFDo/g, t: 'Ação' },
        { r: /cria\uFFFD\uFFFD/gi, t: 'criação' },
        { r: /gera\uFFFD\uFFFD/gi, t: 'geração' },
        { r: /atra\uFFFD\uFFFD/gi, t: 'atração' },
        { r: /Altera\uFFFD\uFFFDes/gi, t: 'Alterações' },
        { r: /vocêê/g, t: 'você' },
        { r: /Vocêê/g, t: 'Você' },
        { r: /Acesso Negado\. Esta ǭrea Ǹ restrita ao Administrador\./g, t: 'Acesso Negado. Esta área é restrita ao Administrador.' }
      ];

      let original = content;
      regexReplacements.forEach(rep => {
        content = content.replace(rep.r, rep.t);
      });
      
      if (original !== content) {
        fs.writeFileSync(file, content, 'utf8');
        count++;
      }
    }
  });
  return count;
}
console.log('Files fixed: ' + walk('src'));
