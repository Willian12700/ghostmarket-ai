const fs = require('fs');

let sb = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

// 1. Move WhatsApp input to a new Step 4, and make Preview Step 5
const stepsArrayStr = `
  const steps = [
    { id: 1, name: 'HTML', desc: 'Estrutura', value: htmlContent, setter: setHtmlContent, accept: '.html' },
    { id: 2, name: 'CSS', desc: 'Estilos', value: cssContent, setter: setCssContent, accept: '.css' },
    { id: 3, name: 'JS', desc: 'Scripts', value: jsContent, setter: setJsContent, accept: '.js' },
    { id: 4, name: 'WhatsApp', desc: 'Botão Mágico', value: whatsappNumber, setter: setWhatsappNumber, accept: '' },
    { id: 5, name: 'Preview', desc: 'Publicar', value: '', setter: () => {}, accept: '' }
  ]
`;

sb = sb.replace(
  /const steps = \[.*?\]/s,
  stepsArrayStr.trim()
);

// Update step conditions
sb = sb.replace(/step < 4/g, 'step < 5');
sb = sb.replace(/step === 4/g, 'step === 5');

// Update UI logic for Step 4
const step4UI = `
            {step < 4 ? (
              <motion.div key="editor" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col bg-panel rounded-2xl border border-border overflow-hidden shadow-2xl">
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
              </motion.div>
            ) : step === 4 ? (
              <motion.div key="whatsapp" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex-1 flex flex-col items-center justify-center bg-panel rounded-2xl border border-border overflow-hidden shadow-2xl p-8">
                <div className="max-w-md w-full space-y-6 text-center">
                  <div className="w-20 h-20 bg-[#25d366]/20 text-[#25d366] rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(37,211,102,0.3)]">
                    <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133-.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white">Botão Mágico de WhatsApp</h3>
                  <p className="text-textSecondary">Deseja adicionar um botão flutuante de WhatsApp na sua Landing Page? Se sim, digite seu número abaixo. Se não, deixe em branco e vá para o próximo passo.</p>
                  
                  <div className="bg-background border border-border p-4 rounded-xl">
                    <label className="block text-sm font-bold text-[#25d366] text-left mb-2">Número do WhatsApp (com DDD)</label>
                    <Input 
                      value={whatsappNumber} 
                      onChange={(e) => setWhatsappNumber(e.target.value)} 
                      placeholder="Ex: 5511999999999" 
                      className="h-12 text-lg text-white" 
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
`;

sb = sb.replace(
  /\{\s*step < 4 \? \(\s*<motion\.div key="editor".*?\)\s*:\s*\(/s,
  step4UI
);

// Strip the WhatsApp input from Step 5 (Preview) header
const previewHeaderOld = `<div className="w-full flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <h3 className="text-xl font-bold text-white shrink-0">Preview Final</h3>
                  <div className="flex items-center gap-4 w-full md:w-auto overflow-hidden">
                    <div className="flex items-center bg-panel border border-border px-3 py-1.5 rounded-lg shrink-0">
                      <span className="text-sm font-bold text-[#25d366] mr-2">WhatsApp:</span>
                      <Input 
                        value={whatsappNumber} 
                        onChange={(e) => setWhatsappNumber(e.target.value)} 
                        placeholder="5511999999999" 
                        className="h-8 bg-background border-none w-[120px] text-sm px-2" 
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-panel border border-border p-1 rounded-lg shrink-0">
                      <button onClick={() => setActiveView('desktop')} className={\`p-2 rounded-md transition-all \${activeView === 'desktop' ? 'bg-background text-primary shadow-sm' : 'text-textSecondary hover:text-white'}\`}><Monitor className="w-4 h-4" /></button>
                      <button onClick={() => setActiveView('mobile')} className={\`p-2 rounded-md transition-all \${activeView === 'mobile' ? 'bg-background text-primary shadow-sm' : 'text-textSecondary hover:text-white'}\`}><Smartphone className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>`;

const previewHeaderNew = `<div className="w-full flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">Preview Final</h3>
                  <div className="flex items-center gap-1 bg-panel border border-border p-1 rounded-lg shrink-0">
                    <button onClick={() => setActiveView('desktop')} className={\`p-2 rounded-md transition-all \${activeView === 'desktop' ? 'bg-background text-primary shadow-sm' : 'text-textSecondary hover:text-white'}\`}><Monitor className="w-4 h-4" /></button>
                    <button onClick={() => setActiveView('mobile')} className={\`p-2 rounded-md transition-all \${activeView === 'mobile' ? 'bg-background text-primary shadow-sm' : 'text-textSecondary hover:text-white'}\`}><Smartphone className="w-4 h-4" /></button>
                  </div>
                </div>`;

sb = sb.replace(previewHeaderOld, previewHeaderNew);

// Inject <base target="_top"> into the HTML to fix the links!
// I'll put it right after <head>
const baseTargetLogic = `
    // FIX: Force all links to open in top window to prevent iframe navigation issues
    if (/<head>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/<head>/i, '<head>\\n<base target="_top">');
    } else if (/<html.*?>/i.test(finalHtml)) {
      finalHtml = finalHtml.replace(/(<html.*?>)/i, '$1\\n<head>\\n<base target="_top">\\n</head>');
    } else {
      finalHtml = '<head>\\n<base target="_top">\\n</head>\\n' + finalHtml;
    }
    
    if (whatsappNumber.trim()) {
`;

sb = sb.replace(
  `if (whatsappNumber.trim()) {`,
  baseTargetLogic.trim()
);

// Add allow-top-navigation to the iframe in SiteBuilder
sb = sb.replace(
  `sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"`,
  `sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-top-navigation allow-top-navigation-by-user-activation"`
);

fs.writeFileSync('src/pages/SiteBuilder.tsx', sb);
