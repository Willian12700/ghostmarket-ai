const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// 1. Add Animated Background
const backgroundReplacement = `<div className="min-h-[calc(100vh-64px)] flex flex-col bg-[#09090b] text-white selection:bg-primary/30 relative overflow-hidden">
      
      {/* ANIMATED BACKGROUND BLOBS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 15, ease: "linear" }} 
          className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 blur-[150px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.5, 1] }} 
          transition={{ repeat: Infinity, duration: 20, ease: "linear" }} 
          className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/10 blur-[150px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, 100, 0], scale: [1, 1.1, 1] }} 
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }} 
          className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" 
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]" style={{ backgroundSize: '24px 24px' }}></div>
      </div>
      
      {/* CABEÇALHO / PROGRESSO */}
      <div className="pt-8 pb-4 px-6 max-w-4xl mx-auto w-full relative z-10">`;

content = content.replace(
  '<div className="min-h-[calc(100vh-64px)] flex flex-col bg-[#09090b] text-white selection:bg-primary/30">\n      \n      {/* CABEÇALHO / PROGRESSO */}\n      <div className="pt-8 pb-4 px-6 max-w-4xl mx-auto w-full">',
  backgroundReplacement
);


// 2. Improve the Step 5 Prompt Box
const oldStep5 = `{/* PASSO 5: Resultado / Código */}
          {step === 5 && (
            <motion.div key="step5" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 py-6 h-[600px] flex flex-col">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><Code className="w-7 h-7 text-primary" /> Seu Prompt Inteligente</h2>
                <p className="text-textSecondary text-lg">Copiando este código e colando no cursor/claude, seu sistema nasce perfeito.</p>
              </div>
              
              <div className="flex-1 bg-[#0b0416] rounded-3xl border-2 border-border p-6 overflow-hidden flex flex-col relative group">
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <Button onClick={copyToClipboard} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                    {copied ? 'Copiado!' : 'Copiar Tudo'}
                  </Button>
                </div>
                <div className="flex-1 overflow-auto custom-scrollbar pr-4">
                  <pre className="text-sm md:text-base text-primary/90 whitespace-pre-wrap font-mono leading-relaxed">
                    {generatedPrompt}
                  </pre>
                </div>
              </div>
            </motion.div>
          )}`;

const newStep5 = `{/* PASSO 5: Resultado / Código */}
          {step === 5 && (
            <motion.div key="step5" variants={stepVariants} initial="initial" animate="animate" exit="exit" className="space-y-6 py-6 h-[600px] flex flex-col relative z-10">
              <div className="text-center mb-6">
                <h2 className="text-3xl font-black mb-2 flex items-center justify-center gap-3"><Code className="w-7 h-7 text-primary" /> Seu Prompt Inteligente</h2>
                <p className="text-textSecondary text-lg">Copiando este código e colando na IA, seu sistema nasce perfeito em segundos.</p>
              </div>
              
              <div className="flex-1 relative group">
                {/* GLOW EFFECT */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-fuchsia-600 to-indigo-600 rounded-[2rem] blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                
                {/* TERMINAL WINDOW */}
                <div className="relative h-full bg-[#050505]/90 backdrop-blur-xl rounded-3xl border border-white/10 flex flex-col overflow-hidden">
                  
                  {/* TERMINAL HEADER */}
                  <div className="h-14 bg-white/5 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full bg-danger/80"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-warning/80"></div>
                      <div className="w-3.5 h-3.5 rounded-full bg-success/80"></div>
                      <span className="ml-4 text-xs font-mono text-textSecondary hidden sm:block">ghostmarket@ai: ~/prompt-generator</span>
                    </div>
                    
                    <Button onClick={copyToClipboard} className="h-9 px-4 text-sm font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.3)] rounded-lg transition-all hover:scale-105">
                      {copied ? <Check className="w-4 h-4 mr-2 text-success" /> : <Copy className="w-4 h-4 mr-2" />}
                      {copied ? 'Copiado!' : 'Copiar Prompt'}
                    </Button>
                  </div>
                  
                  {/* TERMINAL BODY */}
                  <div className="flex-1 overflow-auto custom-scrollbar p-6">
                    <pre className="text-sm md:text-base text-emerald-400 whitespace-pre-wrap font-mono leading-relaxed" style={{ textShadow: '0 0 10px rgba(52,211,153,0.3)' }}>
                      {generatedPrompt}
                    </pre>
                  </div>
                </div>
              </div>
            </motion.div>
          )}`;

content = content.replace(oldStep5, newStep5);

fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
