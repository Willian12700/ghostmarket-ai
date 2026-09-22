const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

// Remove 'Simular Produto' button
const simulateBtnRegex = /<Button\s+variant="outline"\s+className="h-12 px-6 font-bold border-dashed[^>]+>[\s\S]*?<\/Button>/;
content = content.replace(simulateBtnRegex, '');

// Remove 'Simular Robô (Cron Job)' button
const cronBtnRegex = /<Button\s+variant="outline"\s+size="sm"\s+className="border-primary\/50 text-primary hover:bg-primary\/10"[^>]+>[\s\S]*?<\/Button>/;
content = content.replace(cronBtnRegex, '');

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
