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
      addToast('CÃ³digo-fonte nÃ£o encontrado para este site. Certifique-se de que nÃ£o Ã© um link camuflado.', 'error');
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

// 4. PREVIEW IFRAME at the top of the card
code = code.replace(
  /className="bg-\[\#130e1d\] border border-\[\#261f36\] rounded-2xl p-6 hover:border-\[\#3b3054\] \\ntransition-all group flex flex-col shadow-lg relative overflow-hidden"\\n\s*>/g,
  `className="bg-surface-elevated border border-border rounded-3xl hover:border-borderHover transition-all group flex flex-col shadow-lg relative overflow-hidden"
                  >
                    {!site.isRedirect && site.rawHtml ? (
                      <div className="w-full h-32 bg-[#000] relative overflow-hidden border-b border-border shrink-0">
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
                      <div className="w-full h-32 bg-background flex items-center justify-center border-b border-border shrink-0 relative overflow-hidden">
                        <LayoutTemplate className="w-12 h-12 text-border" />
                      </div>
                    )}
                    <div className="p-6 flex flex-col flex-1">`
);

// We need to replace the old p-6 padding which was on the root card, and now we moved it into the inner wrapper.
// So we find the closing tag of motion.div and add the closing tag of the inner wrapper.
code = code.replace(/<\/motion\.div>/g, '</div>\n                </motion.div>');

// 5. ZIP Button
const zipButton = `
                          {!site.isRedirect && site.rawHtml && (
                            <button onClick={() => handleDownloadZip(site)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Baixar ZIP (CÃ³digo Fonte)">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
`;

code = code.replace(/<button onClick=\{\(\) => \{[^>]*const url = `\$\{window\.location\.origin\}\/report/, zipButton + '\n$&');

fs.writeFileSync('src/pages/HostedSites.tsx', code, 'utf8');
