const fs = require('fs');
let code = fs.readFileSync('src/pages/Chatbots.tsx', 'utf8');

const processingStateBlock = `
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  
  const processingSteps = [
    "Inicializando Núcleo Cognitivo...",
    "Estruturando Comportamento ({role})...",
    "Injetando Prompt de Sistema...",
    "Compilando Identidade Visual...",
    "Ativando Atendente IA..."
  ];

  const handleSaveWithAI = async () => {
    setIsProcessing(true);
    setProcessingStep(0);
    
    // Simulate AI loading steps
    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      await new Promise(r => setTimeout(r, 600)); // 600ms per step
    }
    
    await handleSave();
    setIsProcessing(false);
  }
`;

code = code.replace(/const \[isSaving, setIsSaving\] = useState\(false\)/, "const [isSaving, setIsSaving] = useState(false)\n" + processingStateBlock);

code = code.replace(/onClick=\{handleSave\}/, 'onClick={handleSaveWithAI}');
code = code.replace(/disabled=\{isSaving\}/, 'disabled={isProcessing || isSaving}');
code = code.replace(/\{isSaving \? 'Salvando\.\.\.' : 'Finalizar e Ativar IA'\}/, "{isProcessing ? 'Compilando...' : (isSaving ? 'Salvando...' : 'Finalizar e Ativar IA')}");

const overlay = `
      <AnimatePresence>
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/90 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <div className="max-w-md w-full bg-surface-elevated border border-border rounded-2xl p-8 flex flex-col items-center text-center shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-surface">
                <motion.div 
                  className="h-full bg-accent"
                  initial={{ width: '0%' }}
                  animate={{ width: \`\${((processingStep + 1) / processingSteps.length) * 100}%\` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              
              <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center mb-8 relative">
                <div className="absolute inset-0 rounded-full border-t-2 border-accent animate-spin" />
                <Bot className="w-10 h-10 text-accent animate-pulse" />
              </div>
              
              <h3 className="text-xl font-bold text-textPrimary mb-2">Construindo sua IA</h3>
              
              <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={processingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-accent font-medium"
                  >
                    {processingSteps[processingStep].replace('{role}', formData.role)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
`;

code = code.replace(/<AnimatedBackground \/>/, "<AnimatedBackground />\n" + overlay);

fs.writeFileSync('src/pages/Chatbots.tsx', code, 'utf8');
