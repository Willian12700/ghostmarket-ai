const fs = require('fs');

function patchFile(file, hasWand) {
  let c = fs.readFileSync(file, 'utf8');
  c = c.replace(/import \{ toast \} from 'sonner'/, "import { useToastStore } from '@/store/toastStore'");
  
  // Find where useState is declared and inject useToastStore
  c = c.replace(/const \[copied, setCopied\] = useState\(false\)/, "const [copied, setCopied] = useState(false)\n  const { addToast } = useToastStore()");
  
  c = c.replace(/toast\.success\((.*?)\)/g, "addToast($1, 'success')");
  c = c.replace(/toast\.error\((.*?)\)/g, "addToast($1, 'error')");
  
  if (hasWand) {
    c = c.replace(/import \{ Copy/, "import { Wand2, Copy");
  }
  
  fs.writeFileSync(file, c);
}

patchFile('src/pages/tiktok/AdCopy.tsx', true);
patchFile('src/pages/tiktok/PersonaGenerator.tsx', false);
patchFile('src/pages/tiktok/ViralScripts.tsx', true);
