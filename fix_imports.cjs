const fs = require('fs');

const fixGlass = () => {
  let file = 'src/components/ui/GlassTerminal.tsx';
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/,\s*language\s*=\s*"text"/, '');
  c = c.replace(/language\?: string;/, '');
  fs.writeFileSync(file, c);
}

const fixImports = (file) => {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace("import { GlassTerminal } from '@/components/ui/GlassTerminal'\n", '');
  fs.writeFileSync(file, c);
}

fixGlass();
fixImports('src/pages/Chatbots.tsx');
fixImports('src/pages/Scanner.tsx');
fixImports('src/pages/marketing/PlrGenerator.tsx');
