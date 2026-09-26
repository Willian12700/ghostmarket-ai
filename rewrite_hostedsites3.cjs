const fs = require('fs');

let code = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// 1. Imports
if (!code.includes('import JSZip')) {
  code = code.replace(
    /import \{ motion, AnimatePresence \} from 'framer-motion'/,
    "import { motion, AnimatePresence } from 'framer-motion'\nimport JSZip from 'jszip'\nimport { saveAs } from 'file-saver'\nimport { Download, LayoutTemplate } from 'lucide-react'"
  );
}

// 2. Type
code = code.replace(
  /redirectUrl\?: string;/,
  "redirectUrl?: string;\n  rawHtml?: string;"
);

// 3. Zip Handler
const zipFunc = `
  const handleDownloadZip = async (site: Site) => {
    if (!site.rawHtml) {
      addToast('Código-fonte não encontrado.', 'error');
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
code = code.replace(/const handleDelete = async/, `${zipFunc}\n\n  const handleDelete = async`);

// 4. Update Card Header (Preview)
const oldCardHeader = `<div className="flex items-start justify-between mb-8">`;
const newCardHeader = `
                    {!site.isRedirect && site.rawHtml ? (
                      <div className="w-full h-32 bg-[#000] relative overflow-hidden border-b border-border shrink-0 rounded-t-2xl">
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
                      <div className="w-full h-32 bg-background flex items-center justify-center border-b border-border shrink-0 relative overflow-hidden rounded-t-2xl">
                        <LayoutTemplate className="w-12 h-12 text-border" />
                      </div>
                    )}
                    
                    <div className="p-6 flex flex-col flex-1">
                      <div className="flex items-start justify-between mb-6">`;

// 5. Update the Card's root className and padding
code = code.replace(
  /className="bg-\[\#130e1d\] border border-\[\#261f36\] rounded-2xl p-6 hover:border-\[\#3b3054\] \\ntransition-all group flex flex-col shadow-lg relative overflow-hidden"/g,
  `className="bg-surface-elevated border border-border rounded-3xl hover:border-borderHover transition-all group flex flex-col shadow-lg relative overflow-hidden"`
);

// Apply Card Header replacement
code = code.replace(oldCardHeader, newCardHeader);

// 6. Update Action Buttons
const copyButtonStart = `<button onClick={() => {\n                          const url = \`\${window.location.origin}/report/\${site.id}\`;`;
const newButtons = `
                          {!site.isRedirect && site.rawHtml && (
                            <button onClick={() => handleDownloadZip(site)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Baixar ZIP">
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          ${copyButtonStart}`;
code = code.replace(copyButtonStart, newButtons);

// 7. Close the div added by newCardHeader
code = code.replace(/<\/motion\.div>/, '</div>\n                </motion.div>');

fs.writeFileSync('src/pages/HostedSites.tsx', code, 'utf8');
