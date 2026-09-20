const fs = require('fs');
['src/pages/tiktok/AdCopy.tsx', 'src/pages/tiktok/PersonaGenerator.tsx', 'src/pages/tiktok/ViralScripts.tsx'].forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  
  c = c.replace(/import \{ useToast \} from '@\/components\/ui\/Toast'/g, "import { toast } from 'sonner'");
  c = c.replace(/const \{ addToast \} = useToast\(\)/g, "");
  
  // Replace addToast(msg, 'success') with toast.success(msg)
  // Replace addToast(msg, 'error') with toast.error(msg)
  c = c.replace(/addToast\((.*?),\s*'success'\)/g, "toast.success($1)");
  c = c.replace(/addToast\((.*?),\s*'error'\)/g, "toast.error($1)");
  
  // Also fix Wand2 import in PersonaGenerator if unused
  c = c.replace(/Wand2, /g, "");

  fs.writeFileSync(f, c);
});
