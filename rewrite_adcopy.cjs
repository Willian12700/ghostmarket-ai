const fs = require('fs');
let code = fs.readFileSync('src/pages/tiktok/AdCopy.tsx', 'utf8');

code = code.split('bg-[#09090b]').join('bg-background');

code = code.replace(/Card className=\"border-border\/50 bg-panel\/50 backdrop-blur-sm shadow-2xl/g, 
  'Card className=\"border-border bg-surface-elevated shadow-2xl rounded-2xl');

code = code.split('bg-panel').join('bg-surface-elevated');

const processingStateBlock = `
  const [processingStep, setProcessingStep] = useState(0);
  
  const processingSteps = [
    "Analisando métricas do algoritmo...",
    "Estruturando ganchos persuasivos...",
    "Aplicando gatilhos mentais de {emotion}...",
    "Gerando variações de copy...",
    "Finalizando formatação..."
  ];
`;

code = code.replace(/const \[isGenerating, setIsGenerating\] = useState\(false\)/, "const [isGenerating, setIsGenerating] = useState(false)\n" + processingStateBlock);

code = code.replace(/setIsGenerating\(true\)\n      setStep\(6\)/, `setIsGenerating(true)
      setProcessingStep(0)
      for(let i = 0; i < processingSteps.length; i++) {
        setProcessingStep(i)
        await new Promise(r => setTimeout(r, 600))
      }
      setStep(6)`);

const overlay = `
      <AnimatePresence>
        {isGenerating && step !== 6 && (
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
                <TrendingUp className="w-10 h-10 text-accent animate-pulse" />
              </div>
              
              <h3 className="text-xl font-bold text-textPrimary mb-2">Hackeando o Algoritmo</h3>
              
              <div className="h-8 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={processingStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-accent font-medium"
                  >
                    {processingSteps[processingStep]?.replace('{emotion}', formData.emotion)}
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
`;

code = code.replace(/<AnimatedBackground \/>/, "<AnimatedBackground />\n" + overlay);

fs.writeFileSync('src/pages/tiktok/AdCopy.tsx', code, 'utf8');
