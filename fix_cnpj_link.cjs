const fs = require('fs');

let code = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

code = code.replace(
  /href=\{`https:\/\/casadosdados\.com\.br\/cnpj\?q=\$\{encodeURIComponent\(xrayLead\.name \+ ' ' \+ xrayLead\.city\)\}`\}/g,
  "href={`https://www.google.com/search?q=${encodeURIComponent(xrayLead.name + ' ' + xrayLead.city + ' cnpj')}`}"
);

fs.writeFileSync('src/pages/Scanner.tsx', code, 'utf8');
