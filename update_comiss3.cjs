const fs = require('fs');

let pubCode = fs.readFileSync('src/pages/PublicPartners.tsx', 'utf8');
// Fix the Mensal block which is around R$ 14,99
pubCode = pubCode.replace('R$ 14,99\n              </div>\n              <p className="text-sm text-primary font-medium mt-3 bg-primary/10 inline-block px-3 py-1 rounded-full">Por cada venda deste plano (35%)</p>', 'R$ 14,99\n              </div>\n              <p className="text-sm text-primary font-medium mt-3 bg-primary/10 inline-block px-3 py-1 rounded-full">Por cada venda deste plano (50%)</p>');
fs.writeFileSync('src/pages/PublicPartners.tsx', pubCode, 'utf8');

// Also check Affiliates.tsx
let affCode = fs.readFileSync('src/pages/Affiliates.tsx', 'utf8');
affCode = affCode.replace('R$ 14,99\n            </div>\n            <p className="text-sm text-textSecondary mt-2">Sua comissão (35%) a cada venda do Plano Mensal.</p>', 'R$ 14,99\n            </div>\n            <p className="text-sm text-textSecondary mt-2">Sua comissão (50%) a cada venda do Plano Mensal.</p>');
fs.writeFileSync('src/pages/Affiliates.tsx', affCode, 'utf8');
