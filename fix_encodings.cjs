const fs = require('fs');

let prompt = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// Fix utf8 corruption in PromptBuilder
prompt = prompt.replace(/Cat[^\x00-\x7F]+logo/g, 'Catálogo');
prompt = prompt.replace(/Pre[^\x00-\x7F]+os/g, 'Preços');
prompt = prompt.replace(/Integra[^\x00-\x7F]+o/g, 'Integração');
prompt = prompt.replace(/Endere[^\x00-\x7F]+os/g, 'Endereços');
prompt = prompt.replace(/aplica[^\x00-\x7F]+o/g, 'aplicação');
prompt = prompt.replace(/convers[^\x00-\x7F]+o/g, 'conversão');
prompt = prompt.replace(/p[^\x00-\x7F]+blico/g, 'público');
prompt = prompt.replace(/solu[^\x00-\x7F]+o/g, 'solução');
prompt = prompt.replace(/escal[^\x00-\x7F]+vel/g, 'escalável');
prompt = prompt.replace(/gest[^\x00-\x7F]+o/g, 'gestão');
prompt = prompt.replace(/automa[^\x00-\x7F]+o/g, 'automação');
prompt = prompt.replace(/Sa[^\x00-\x7F]+de/g, 'Saúde');
prompt = prompt.replace(/M[^\x00-\x7F]+dicos/g, 'Médicos');
prompt = prompt.replace(/Finan[^\x00-\x7F]+as/g, 'Finanças');
prompt = prompt.replace(/gr[^\x00-\x7F]+ficos/g, 'gráficos');
prompt = prompt.replace(/relat[^\x00-\x7F]+rios/g, 'relatórios');
prompt = prompt.replace(/Educa[^\x00-\x7F]+o/g, 'Educação');
prompt = prompt.replace(/Descri[^\x00-\x7F]+o/g, 'Descrição');
prompt = prompt.replace(/VIS[^\x00-\x7F]+O/g, 'VISÃO');
prompt = prompt.replace(/N[^\x00-\x7F]+o/g, 'Não');

fs.writeFileSync('src/pages/PromptBuilder.tsx', prompt, 'utf8');
console.log("Fixed encodings");
