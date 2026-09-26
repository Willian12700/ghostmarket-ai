const fs = require('fs');

let code = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// 1. Add JSZip and file-saver imports
const importsToAdd = `
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Download, LayoutTemplate } from 'lucide-react';
`;

if (!code.includes('import JSZip')) {
  code = code.replace(/import \{ motion, AnimatePresence \} from 'framer-motion'/, `import { motion, AnimatePresence } from 'framer-motion'\n${importsToAdd}`);
}

// 2. Add rawHtml to type Site
if (!code.includes('rawHtml?: string')) {
  code = code.replace(/redirectUrl\?: string;/, "redirectUrl?: string;\n  rawHtml?: string;");
}

// 3. Add handleDownloadZip function inside the component
const zipFunc = `
  const handleDownloadZip = async (site: Site) => {
    if (!site.rawHtml) {
      addToast('Código-fonte não encontrado para este site. Certifique-se de que não é um link camuflado.', 'error');
      return;
    }
    try {
      const zip = new JSZip();
      zip.file("index.html", site.rawHtml);
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, \`\${site.id}.zip\`);
      addToast('Download iniciado com sucesso!', 'success');
    } catch(e) {
      console.error(e);
      addToast('Erro ao criar o arquivo ZIP', 'error');
    }
  }
`;

if (!code.includes('handleDownloadZip')) {
  code = code.replace(/const handleDelete = async/, `${zipFunc}\n\n  const handleDelete = async`);
}

// 4. Update the Card rendering to show the iframe preview and the Download ZIP button
const cardReplacement = `
                  <motion.div 
                    key={site.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-surface-elevated border border-border rounded-3xl hover:border-borderHover transition-all group flex flex-col shadow-lg relative overflow-hidden"
                  >
                    {/* PREVIEW DA PÁGINA INICIAL */}
                    {!site.isRedirect && site.rawHtml ? (
                      <div className="w-full h-32 bg-[#000] relative overflow-hidden border-b border-border">
                        <div className="absolute inset-0 origin-top-left" style={{ transform: 'scale(0.25)', width: '400%', height: '400%' }}>
                          <iframe 
                            srcDoc={site.rawHtml} 
                            className="w-full h-full border-none pointer-events-none" 
                            sandbox="allow-same-origin"
                            scrolling="no"
                          />
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-surface-elevated to-transparent" />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-background flex items-center justify-center border-b border-border relative overflow-hidden">
                        <LayoutTemplate className="w-12 h-12 text-border" />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex flex-col gap-1">
                          {site.isRedirect ? (
                            <div className="flex items-center gap-2 text-pink-400">
                              <Link2 className="w-4 h-4" />
                              <span className="text-xs font-bold tracking-widest uppercase">Camuflado</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-primary">
                              <Globe className="w-4 h-4" />
                              <span className="text-xs font-bold tracking-widest uppercase">Landing Page</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1.5 shadow-sm w-fit mt-2">
                            <Eye className="w-3.5 h-3.5 text-textSecondary" />
                            <span className="text-xs font-bold text-white">{site.views || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggleStatus(site.id, site.isActive !== false)} className={\`w-8 h-8 flex items-center justify-center rounded-lg transition-colors \${site.isActive !== false ? 'hover:bg-emerald-500/10 text-emerald-400' : 'hover:bg-red-500/10 text-red-400'}\`} title={site.isActive !== false ? 'Desativar Site' : 'Ativar Site'}>
                            <Power className="w-4 h-4" />
                          </button>
                          {!site.isRedirect && site.rawHtml && (
                            <button onClick={() => handleDownloadZip(site)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Baixar ZIP (Código Fonte)">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
`;

code = code.replace(/<motion\.div[^>]*>\s*<div className="flex items-start justify-between mb-8">[\s\S]*?(?=<button onClick=\{\(\) => \{\s*const url = `\$\{window\.location\.origin\}\/report)/, cardReplacement);

fs.writeFileSync('src/pages/HostedSites.tsx', code, 'utf8');
