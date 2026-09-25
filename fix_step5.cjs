const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// Fix step 5 height constraint
content = content.replace(
  'className="space-y-6 py-6 h-[600px] flex flex-col relative z-10"',
  'className="space-y-6 py-6 flex flex-col relative z-10" style={{ minHeight: "500px", height: "60vh" }}'
);

// We need to import useNavigate to redirect to /builder
if (!content.includes('import { useNavigate }')) {
  content = content.replace(
    "import { useState, useEffect } from 'react'",
    "import { useState, useEffect } from 'react'\nimport { useNavigate } from 'react-router-dom'"
  );
}

// Ensure useNavigate is initialized
if (!content.includes('const navigate = useNavigate()')) {
  content = content.replace(
    "const { addToast } = useToastStore()",
    "const { addToast } = useToastStore()\n  const navigate = useNavigate()"
  );
}

// Replace the step 5 buttons
const oldStep5Buttons = `{step === 5 && (
            <Button 
              onClick={() => setStep(1)} 
              className="h-14 px-10 text-lg font-black bg-panel border-2 border-border text-white hover:border-primary rounded-2xl transition-all"
            >
              Criar Novo Site
            </Button>
          )}`;

const newStep5Buttons = `{step === 5 && (
            <div className="flex flex-col sm:flex-row items-center gap-4 ml-auto">
              <Button 
                onClick={() => setStep(1)} 
                className="h-14 px-8 text-lg font-black bg-panel border-2 border-border text-textSecondary hover:text-white hover:border-white/20 rounded-2xl transition-all"
              >
                Refazer Prompt
              </Button>
              <Button 
                onClick={() => navigate('/builder')} 
                className="h-14 px-10 text-lg font-black bg-primary hover:bg-primary/90 text-white rounded-2xl shadow-[0_0_30px_rgba(139,92,246,0.5)] hover:scale-105 transition-all flex items-center gap-2"
              >
                <Zap className="w-5 h-5" /> Hospedar Sistema
              </Button>
            </div>
          )}`;

content = content.replace(oldStep5Buttons, newStep5Buttons);

fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
