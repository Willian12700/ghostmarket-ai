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

  // Add AnimatedBackground import
  if (!content.includes('AnimatedBackground')) {
    content = content.replace(
      "import { useState } from 'react'",
      "import { useState } from 'react'\nimport { AnimatedBackground } from '@/components/ui/AnimatedBackground'"
    );
    
    // Also try to find it if it doesn't have useState on line 1 exactly
    if (!content.includes('AnimatedBackground')) {
      content = "import { AnimatedBackground } from '@/components/ui/AnimatedBackground'\n" + content;
    }
  }

  // Add GlassTerminal import
  if (!content.includes('GlassTerminal')) {
    content = content.replace(
      "import { AnimatedBackground }",
      "import { GlassTerminal } from '@/components/ui/GlassTerminal'\nimport { AnimatedBackground }"
    );
  }

  // Replace standard background with AnimatedBackground wrapper
  // Usually it starts with: <div className="max-w-4xl mx-auto
  // or <div className="space-y-6 max-w-5xl
  const mainDivRegex = /<div className="([^"]+max-w-[^"]+)"([^>]*)>/;
  const match = content.match(mainDivRegex);
  
  if (match && !content.includes('<AnimatedBackground />')) {
    const originalClasses = match[1];
    const newClasses = originalClasses + " relative z-10 min-h-[calc(100vh-64px)] pb-20";
    
    content = content.replace(
      match[0],
      `<div className="relative overflow-hidden w-full bg-[#09090b] text-white selection:bg-primary/30">\n      <AnimatedBackground />\n      <div className="${newClasses}"${match[2]}>`
    );
    
    // We must close the extra div at the end of the return statement
    // Simple heuristic: replace the last </div> with </div></div>
    const lastDivIndex = content.lastIndexOf('</div>');
    if (lastDivIndex !== -1) {
      content = content.substring(0, lastDivIndex) + '</div>\n    </div>' + content.substring(lastDivIndex + 6);
    }
    changed = true;
  }

  // Find the result box and replace with GlassTerminal
  // Usually it's a Card with <pre> inside or just <pre>
  if (content.includes('setGeneratedResult') || content.includes('setGeneratedScript') || content.includes('setGeneratedVsl') || content.includes('generatedText') || content.includes('generatedCopy')) {
    
    const varNameMatch = content.match(/set(Generated[A-Za-z]+)\(/) || content.match(/set(GeneratedResult)\(/) || content.match(/set(GeneratedCopy)\(/);
    if (varNameMatch) {
      const stateVar = varNameMatch[1].charAt(0).toLowerCase() + varNameMatch[1].slice(1);
      
      // Replace the standard output UI with GlassTerminal
      // A common pattern is:
      // <div className="bg-panelHover ..."><pre>{generatedResult}</pre></div>
      // We will look for <pre> tags and replace their parent containers
      
      const preRegex = /<div[^>]*bg-panelHover[^>]*>[\s\S]*?<pre[^>]*>\s*\{?([^}]+)\}?\s*<\/pre>[\s\S]*?<\/div>/;
      if (preRegex.test(content)) {
         content = content.replace(preRegex, `<div className="mt-8 h-[500px]"><GlassTerminal content={${stateVar} || ''} /></div>`);
         changed = true;
      } else {
         const preRegex2 = /<div[^>]*bg-background[^>]*>[\s\S]*?<pre[^>]*>\s*\{?([^}]+)\}?\s*<\/pre>[\s\S]*?<\/div>/;
         if (preRegex2.test(content)) {
            content = content.replace(preRegex2, `<div className="mt-8 h-[500px]"><GlassTerminal content={${stateVar} || ''} /></div>`);
            changed = true;
         }
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
