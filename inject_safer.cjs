const fs = require('fs');
const path = require('path');

const pagesToUpgrade = [
  'src/pages/Creator.tsx',
  'src/pages/Scanner.tsx',
  'src/pages/Chatbots.tsx',
  'src/pages/tiktok/PersonaGenerator.tsx',
  'src/pages/tiktok/ViralScripts.tsx',
  'src/pages/tiktok/AdCopy.tsx',
  'src/pages/marketing/VslGenerator.tsx',
  'src/pages/marketing/PlrGenerator.tsx',
  'src/pages/marketing/AdsGenerator.tsx',
  'src/pages/marketing/EmailFunnel.tsx'
];

pagesToUpgrade.forEach(file => {
  if (!fs.existsSync(file)) return;
  
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (!content.includes('AnimatedBackground')) {
    content = "import { AnimatedBackground } from '@/components/ui/AnimatedBackground'\n" + content;
    changed = true;
  }
  if (!content.includes('GlassTerminal')) {
    content = "import { GlassTerminal } from '@/components/ui/GlassTerminal'\n" + content;
    changed = true;
  }

  if (!content.includes('<AnimatedBackground />')) {
    const returnRegex = /return\s*\(\s*<div\s+className="([^"]+)"\s*>/;
    const match = content.match(returnRegex);
    if (match) {
      const origClasses = match[1];
      const newClasses = origClasses + " relative z-10 min-h-screen pb-20";
      
      const newStr = "return (\n    <div className=\"relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30\">\n      <AnimatedBackground />\n      <div className=\"" + newClasses + "\">";
      content = content.replace(match[0], newStr);
      
      const lastDivRegex = /<\/div>\s*\)\s*\}/;
      if (lastDivRegex.test(content)) {
        content = content.replace(lastDivRegex, "</div>\n    </div>\n  )\n}");
      } else {
         const lastDivRegex2 = /<\/div>\s*\)\s*$/;
         if (lastDivRegex2.test(content)) {
            content = content.replace(lastDivRegex2, "</div>\n    </div>\n  )");
         }
      }
      changed = true;
    }
  }

  // <pre className="whitespace-pre-wrap...">{generatedResult}</pre>
  const preRegex = /<pre[^>]*>\s*\{?([^}]+)\}?\s*<\/pre>/;
  const preMatch = content.match(preRegex);
  if (preMatch && !content.includes('<GlassTerminal content=')) {
    let stateVar = preMatch[1].trim(); 
    if (stateVar.includes('||')) stateVar = "(" + stateVar + ")";
    const newStr = "<div className=\"mt-8 h-[500px]\"><GlassTerminal content={" + stateVar + " || ''} /></div>";
    content = content.replace(preMatch[0], newStr);
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
