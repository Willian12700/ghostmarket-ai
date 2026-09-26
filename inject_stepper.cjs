const fs = require('fs');

function injectStepper(filePath, step) {
  let code = fs.readFileSync(filePath, 'utf8');
  
  if (!code.includes('CreationStepper')) {
    code = code.replace(/import \{.*?\} from 'lucide-react'/, "$&\nimport { CreationStepper } from '@/components/ui/CreationStepper'");
  }
  
  if (code.includes('<AnimatedBackground />')) {
    code = code.replace(/<AnimatedBackground \/>(\s*<div className=".*?(max-w-7xl|max-w-4xl|max-w-6xl|max-w-5xl).*?">)/, 
      "<AnimatedBackground />\n$1\n          <CreationStepper currentStep={" + step + "} />");
  }
  
  fs.writeFileSync(filePath, code, 'utf8');
}

injectStepper('src/pages/Scanner.tsx', 1);
injectStepper('src/pages/PromptBuilder.tsx', 2);
injectStepper('src/pages/SiteBuilder.tsx', 3);
