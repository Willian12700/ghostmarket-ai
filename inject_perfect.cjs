const fs = require('fs');

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
  let content = fs.readFileSync(file, 'utf8');
  
  if (!content.includes('AnimatedBackground')) {
    content = "import { AnimatedBackground } from '@/components/ui/AnimatedBackground'\n" + content;
  }
  if (!content.includes('GlassTerminal')) {
    content = "import { GlassTerminal } from '@/components/ui/GlassTerminal'\n" + content;
  }

  const returnIdx = content.indexOf('return (');
  if (returnIdx !== -1) {
    const firstDivIdx = content.indexOf('<div', returnIdx);
    if (firstDivIdx !== -1 && !content.includes('<AnimatedBackground />')) {
      const classStart = content.indexOf('className="', firstDivIdx) + 11;
      const classEnd = content.indexOf('"', classStart);
      const classes = content.substring(classStart, classEnd);
      
      const newClasses = classes + " relative z-10 min-h-screen pb-20";
      
      const beforeClass = content.substring(0, classStart - 11);
      const afterClass = content.substring(classEnd + 1);
      
      content = beforeClass + 'className="' + newClasses + '"' + afterClass;
      
      const toInject = '<div className="relative overflow-x-hidden min-h-[calc(100vh-64px)] w-full bg-[#09090b] text-white selection:bg-primary/30">\n      <AnimatedBackground />\n      ';
      content = content.substring(0, firstDivIdx) + toInject + content.substring(firstDivIdx);
      
      const lastClosingBraceIdx = content.lastIndexOf('}');
      if (lastClosingBraceIdx !== -1) {
        const lastParenIdx = content.lastIndexOf(')', lastClosingBraceIdx);
        if (lastParenIdx !== -1) {
            content = content.substring(0, lastParenIdx) + '  </div>\n  ' + content.substring(lastParenIdx);
        }
      }
    }
  }

  const matchPre = content.match(/<pre[^>]*>\s*\{?([^}]+)\}?\s*<\/pre>/);
  if (matchPre && !content.includes('<GlassTerminal content=')) {
    let stateVar = matchPre[1].trim(); 
    if (stateVar.includes('||')) stateVar = "(" + stateVar + ")";
    const newStr = "<div className=\"mt-8 h-[500px] w-full\"><GlassTerminal content={" + stateVar + " || ''} /></div>";
    content = content.replace(matchPre[0], newStr);
  }

  const matchDiv = content.match(/<div[^>]*whitespace-pre-wrap[^>]*>\s*\{?([^}]+)\}?\s*<\/div>/);
  if (matchDiv && !content.includes('<GlassTerminal content=')) {
    let stateVar = matchDiv[1].trim(); 
    if (stateVar.includes('||')) stateVar = "(" + stateVar + ")";
    const newStr = "<div className=\"mt-8 h-[500px] w-full\"><GlassTerminal content={" + stateVar + " || ''} /></div>";
    content = content.replace(matchDiv[0], newStr);
  }
  
  fs.writeFileSync(file, content, 'utf8');
});
