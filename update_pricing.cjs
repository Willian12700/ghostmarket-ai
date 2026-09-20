const fs = require('fs');
let content = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

content = content.replace(
  '<div className="text-4xl font-bold text-white mb-6">R$ 149 <span className="text-lg text-textSecondary font-normal">/mês</span></div>',
  '<div className="text-4xl font-bold text-white mb-6">R$ 29,99 <span className="text-lg text-textSecondary font-normal">/mês</span></div>'
);

content = content.replace(
  '<div className="text-4xl font-bold text-white mb-2">12x R$ 30,00</div>',
  '<div className="text-4xl font-bold text-white mb-2">12x R$ 13,41</div>'
);

content = content.replace(
  '<p className="text-sm text-textSecondary mb-6">Ou R$ 360 à vista</p>',
  '<p className="text-sm text-textSecondary mb-6">Ou R$ 129,99 à vista</p>'
);

fs.writeFileSync('src/pages/Landing.tsx', content, 'utf8');
console.log('Done');
