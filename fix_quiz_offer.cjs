const fs = require('fs');

let content = fs.readFileSync('src/pages/QuizPublic.tsx', 'utf8');

// Replace CFG
content = content.replace(
  /checkoutMentoria:\s*".*?"/,
  'checkoutMentoria: "https://pay.cakto.com.br/yonkyi5_1119928"'
);
content = content.replace(
  /precoMentoria:\s*".*?"/,
  'precoMentoria: "R$ 49,99"'
);

// Replace "Mentoria: Como Vender Sites" with "Ghost AI - Acesso Vitalício"
content = content.replace(
  /<h3 className="text-xl font-bold mb-3">Mentoria: Como Vender Sites<\/h3>/,
  '<h3 className="text-xl font-bold mb-3">Ghost AI <span className="text-purple-400">— Vitalício</span></h3>'
);

// Replace features
content = content.replace(
  /<li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0\.5" \/> Passo a passo para os primeiros clientes<\/li>\s*<li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0\.5" \/> Como precificar, apresentar e fechar<\/li>\s*<li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0\.5" \/> Como atrair clientes todas as semanas<\/li>/,
  '<li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Acesso ilimitado e para sempre à plataforma</li>\\n                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Atualizações gratuitas e novos agentes de IA</li>\\n                          <li className="flex items-start gap-2"><Check className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> Economize R$ 190 por ano, sem mensalidades</li>'
);

// Replace /mês
content = content.replace(
  /\{CFG\.precoMentoria\}<span className="text-sm font-normal text-purple-200\/50">\/mês<\/span>/,
  '{CFG.precoMentoria}<span className="text-sm font-normal text-purple-200/50">/único</span>'
);

// Replace Button text
content = content.replace(
  />\s*Quero a Mentoria\s*<\/a>/,
  '>\\n                          Quero o Plano Vitalício\\n                        </a>'
);

// Replace handleCheckoutRedirect argument
content = content.replace(
  /onClick=\{\(e\) => handleCheckoutRedirect\(e, 'Mentoria', CFG\.checkoutMentoria\)\}/,
  "onClick={(e) => handleCheckoutRedirect(e, 'Vitalício', CFG.checkoutMentoria)}"
);

fs.writeFileSync('src/pages/QuizPublic.tsx', content, 'utf8');
