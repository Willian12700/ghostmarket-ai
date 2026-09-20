const fs = require('fs');
let builder = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

builder = builder.replace(
  `import { Plus, GripVertical, Settings2, Trash2, Monitor, Smartphone, Globe, Play, CheckCircle2, Rocket, Image as ImageIcon, Link as LinkIcon, Wand2, Eye } from 'lucide-react'`,
  `import { Plus, GripVertical, Settings2, Trash2, Monitor, Smartphone, Globe, Play, CheckCircle2, Rocket, Image as ImageIcon, Link as LinkIcon, Wand2, Eye, Download, Code, Palette } from 'lucide-react'`
);

// If rocket was already removed
builder = builder.replace(
  `import { Plus, GripVertical, Settings2, Trash2, Monitor, Smartphone, Globe, Play, CheckCircle2, Image as ImageIcon, Link as LinkIcon, Wand2, Eye } from 'lucide-react'`,
  `import { Plus, GripVertical, Settings2, Trash2, Monitor, Smartphone, Globe, Play, CheckCircle2, Image as ImageIcon, Link as LinkIcon, Wand2, Eye, Download, Code, Palette } from 'lucide-react'`
);

builder = builder.replace(
  `const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)`,
  `const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isExportModalOpen, setIsExportModalOpen] = useState(false)
  
  const generateExportHtml = () => {
    let html = '<!DOCTYPE html>\\n<html lang="pt-BR">\\n<head>\\n<meta charset="UTF-8">\\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\\n<title>Meu Site Gerado</title>\\n<script src="https://cdn.tailwindcss.com"></script>\\n<style>\\n  :root { --color-primary: #8b5cf6; }\\n  body { background-color: #0f172a; color: white; font-family: system-ui, -apple-system, sans-serif; }\\n</style>\\n</head>\\n<body>\\n';
    
    blocks.forEach(b => {
      if(b.type === 'hero') {
        html += \`
        <div style="padding: 5rem 1.5rem; text-align: center; background: linear-gradient(to bottom, rgba(139,92,246,0.1), transparent);">
          <h1 style="font-size: 3rem; font-weight: 800; margin-bottom: 1.5rem;">\${b.content.title}</h1>
          <p style="font-size: 1.125rem; color: #94a3b8; max-width: 42rem; margin: 0 auto 2rem;">\${b.content.subtitle}</p>
          <a href="\${b.content.buttonLink || '#'}" style="display: inline-block; background: #8b5cf6; color: white; padding: 1rem 2rem; border-radius: 9999px; font-weight: bold; text-decoration: none; margin-bottom: 3rem;">\${b.content.button}</a>
          <br/>
          <img src="\${b.content.imageUrl || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'}" style="width: 100%; max-width: 64rem; border-radius: 1rem; margin: 0 auto; display: block; object-fit: cover;" alt="Hero">
        </div>\`;
      }
      if(b.type === 'features') {
        html += \`
        <div style="padding: 5rem 1.5rem; background: #1e293b;">
          <h2 style="font-size: 2.25rem; font-weight: bold; text-align: center; margin-bottom: 3rem;">\${b.content.title}</h2>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; max-width: 64rem; margin: 0 auto;">
            <div style="padding: 1.5rem; background: #0f172a; border-radius: 0.75rem; text-align: center;"><h3 style="font-size: 1.25rem; font-weight: bold;">\${b.content.f1}</h3></div>
            <div style="padding: 1.5rem; background: #0f172a; border-radius: 0.75rem; text-align: center;"><h3 style="font-size: 1.25rem; font-weight: bold;">\${b.content.f2}</h3></div>
            <div style="padding: 1.5rem; background: #0f172a; border-radius: 0.75rem; text-align: center;"><h3 style="font-size: 1.25rem; font-weight: bold;">\${b.content.f3}</h3></div>
          </div>
        </div>\`;
      }
      if(b.type === 'pricing') {
        html += \`
        <div style="padding: 5rem 1.5rem; background: #0f172a;">
          <div style="max-width: 24rem; margin: 0 auto; padding: 2rem; background: #1e293b; border-radius: 1rem; text-align: center; border: 1px solid rgba(139,92,246,0.5);">
            <h3 style="font-size: 1.25rem; font-weight: bold; margin-bottom: 0.5rem;">\${b.content.title}</h3>
            <div style="font-size: 2.25rem; font-weight: 800; color: #8b5cf6; margin-bottom: 1rem;">\${b.content.price}</div>
            <p style="color: #94a3b8; margin-bottom: 2rem;">\${b.content.desc}</p>
            <a href="\${b.content.buttonLink || '#'}" style="display: block; width: 100%; background: #8b5cf6; color: white; padding: 1rem; border-radius: 0.5rem; font-weight: bold; text-decoration: none;">\${b.content.button}</a>
          </div>
        </div>\`;
      }
      if(b.type === 'cta') {
        html += \`
        <div style="padding: 5rem 1.5rem; background: #1e293b; text-align: center;">
          <h2 style="font-size: 2.25rem; font-weight: bold; margin-bottom: 2rem;">\${b.content.title}</h2>
          <a href="\${b.content.buttonLink || '#'}" style="display: inline-block; background: #8b5cf6; color: white; padding: 1rem 3rem; border-radius: 9999px; font-weight: bold; text-decoration: none; font-size: 1.125rem;">\${b.content.button}</a>
        </div>\`;
      }
    });
    
    html += '\\n</body>\\n</html>';
    return html;
  }
  
  const handleExport = () => {
    const html = generateExportHtml();
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meu-site-ghostmarket.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  }
`
);

builder = builder.replace(
  `<Button variant="ghost" className="hidden sm:flex" onClick={() => window.open('/s/preview', '_blank')}><Eye className="w-4 h-4 mr-2" /> Preview</Button>`,
  `<Button variant="ghost" className="hidden sm:flex hover:bg-primary/20 hover:text-primary transition-colors" onClick={() => setIsExportModalOpen(true)}><Download className="w-4 h-4 mr-2" /> Exportar Código</Button>
          <Button variant="ghost" className="hidden sm:flex" onClick={() => window.open('/s/preview', '_blank')}><Eye className="w-4 h-4 mr-2" /> Preview</Button>`
);

builder = builder.replace(
  `</AnimatePresence>`,
  `  {isExportModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-panel border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Code className="w-5 h-5 text-primary" /> Exportar Código HTML</h3>
                <button onClick={() => setIsExportModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-textSecondary text-sm">Baixe o código fonte completo do seu site. Você receberá um arquivo .html único com Tailwind CSS embutido, pronto para hospedar em qualquer lugar (Hostinger, Vercel, Netlify, CPanel, etc).</p>
                <div className="p-4 bg-background border border-border rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-white mb-1">100% Seu</p>
                    <p className="text-textSecondary">O código é seu e independente da nossa plataforma.</p>
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsExportModalOpen(false)}>Cancelar</Button>
                  <Button type="button" onClick={handleExport} className="shadow-[0_0_15px_rgba(139,92,246,0.3)]"><Download className="w-4 h-4 mr-2" /> Baixar .HTML</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>`
);

fs.writeFileSync('src/pages/SiteBuilder.tsx', builder);
