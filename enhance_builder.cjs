const fs = require('fs');
let content = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

// 1. Change the main wrapper to include the animated blobs background
const mainWrapperOld = '<div className="h-[calc(100vh-64px)] flex flex-col bg-[#0b0416]">';
const mainWrapperNew = `<div className="h-[calc(100vh-64px)] flex flex-col bg-[#09090b] text-white selection:bg-primary/30 relative overflow-hidden">
        {/* ANIMATED BACKGROUND BLOBS */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <motion.div animate={{ x: [0, 50, 0], y: [0, -50, 0], scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }} className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-primary/20 blur-[150px] rounded-full mix-blend-screen" />
          <motion.div animate={{ x: [0, -50, 0], y: [0, 50, 0], scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] bg-fuchsia-600/10 blur-[150px] rounded-full mix-blend-screen" />
          <motion.div animate={{ x: [0, 100, 0], y: [0, 100, 0], scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02)_1px,transparent_1px)]" style={{ backgroundSize: '24px 24px' }}></div>
        </div>
`;
content = content.replace(mainWrapperOld, mainWrapperNew);

// 2. Improve the Code Editor Box (Mac OS style)
const oldEditor = `              <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col bg-panel rounded-2xl border border-border overflow-hidden shadow-2xl">
                <div className="h-14 bg-background border-b border-border flex items-center justify-between px-6">
                  <div className="flex items-center gap-3">
                    <FileCode2 className="w-5 h-5 text-primary" />
                    <span className="font-bold text-white">Insira seu código {steps[step-1].name}</span>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => triggerUpload(steps[step-1].name.toLowerCase() as any)} className="bg-primary/10 text-primary hover:bg-primary/20">
                    <UploadCloud className="w-4 h-4 mr-2" /> Upload do Arquivo .{steps[step-1].name.toLowerCase()}
                  </Button>
                </div>
                <textarea 
                  value={steps[step-1].value}
                  onChange={(e) => steps[step-1].setter(e.target.value)}
                  placeholder={\`Cole o seu código \${steps[step-1].name} aqui...\`}
                  className="flex-1 w-full bg-[#0d1117] text-gray-300 font-mono text-sm p-6 focus:outline-none resize-none custom-scrollbar"
                  spellCheck={false}
                />
              </motion.div>`;

const newEditor = `              <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col relative group z-10 w-full h-full max-h-full pb-4">
                {/* GLOW EFFECT */}
                <div className="absolute -inset-1 bg-gradient-to-r from-primary via-fuchsia-600 to-indigo-600 rounded-[2rem] blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200 animate-pulse z-0"></div>
                
                {/* MAC OS EDITOR */}
                <div className="relative flex-1 flex flex-col bg-[#050505]/90 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl z-10 h-full">
                  <div className="h-14 bg-white/5 border-b border-white/5 flex items-center justify-between px-6 shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-danger/80"></div>
                      <div className="w-3 h-3 rounded-full bg-warning/80"></div>
                      <div className="w-3 h-3 rounded-full bg-success/80"></div>
                      <span className="ml-4 text-xs font-mono text-textSecondary hidden sm:flex items-center gap-2">
                        <FileCode2 className="w-4 h-4 text-primary" /> ghostmarket@editor: ~/Insira seu código {steps[step-1].name}
                      </span>
                    </div>
                    {steps[step-1].accept && (
                      <Button variant="secondary" size="sm" onClick={() => triggerUpload(steps[step-1].name.toLowerCase() as any)} className="h-8 px-4 text-xs font-bold bg-white text-black hover:bg-white/90 shadow-[0_0_15px_rgba(255,255,255,0.2)] rounded-lg transition-all hover:scale-105">
                        <UploadCloud className="w-4 h-4 mr-2" /> Upload .{steps[step-1].name.toLowerCase()}
                      </Button>
                    )}
                  </div>
                  
                  {step === 4 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#0b0416]/50">
                      <div className="max-w-md w-full space-y-6 text-center">
                        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                           <svg viewBox="0 0 24 24" width="40" height="40" fill="#22c55e"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133-.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        </div>
                        <h3 className="text-2xl font-black text-white">Botão WhatsApp Flutuante</h3>
                        <p className="text-textSecondary">Opcional. Digite o número com DDD para adicionar um botão de chat direto no canto da tela.</p>
                        <Input 
                          value={whatsappNumber}
                          onChange={(e) => setWhatsappNumber(e.target.value)}
                          placeholder="Ex: 11999999999"
                          className="h-14 bg-panel border-2 border-border rounded-xl text-center text-lg font-bold text-white shadow-inner focus:border-green-500 transition-colors"
                        />
                      </div>
                    </div>
                  ) : (
                    <textarea 
                      value={steps[step-1].value}
                      onChange={(e) => steps[step-1].setter(e.target.value)}
                      placeholder={\`Cole o seu código \${steps[step-1].name} aqui...\`}
                      className="flex-1 w-full bg-transparent text-emerald-400 font-mono text-sm p-6 focus:outline-none resize-none custom-scrollbar"
                      spellCheck={false}
                      style={{ textShadow: '0 0 10px rgba(52,211,153,0.2)' }}
                    />
                  )}
                </div>
              </motion.div>`;
content = content.replace(oldEditor, newEditor);

// 3. Fix the top bar
const headerOld = `<div className="h-20 border-b border-border bg-panel flex items-center justify-between px-8 shrink-0 z-10">`;
const headerNew = `<div className="h-24 border-b border-white/5 bg-[#050505]/60 backdrop-blur-md flex items-center justify-between px-8 shrink-0 z-10">`;
content = content.replace(headerOld, headerNew);

// 4. Also there is an issue with the "Next" button at the bottom looking boring. Let's make it glow.
const oldNext = `<Button onClick={() => setStep(step + 1)} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]">`;
const newNext = `<Button onClick={() => setStep(step + 1)} className="h-12 px-8 text-base font-black bg-primary hover:bg-primary/90 text-white rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.5)] hover:scale-105 transition-all">`;
content = content.replace(oldNext, newNext);

// 5. Back button
const oldBack = `<Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="text-textSecondary hover:text-white">`;
const newBack = `<Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className={\`h-12 px-6 text-base font-bold transition-all \${step === 1 ? 'opacity-0' : 'text-textSecondary hover:text-white hover:bg-white/5 rounded-xl'}\`}>`;
content = content.replace(oldBack, newBack);

fs.writeFileSync('src/pages/SiteBuilder.tsx', content, 'utf8');
