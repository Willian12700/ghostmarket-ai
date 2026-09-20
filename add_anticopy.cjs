const fs = require('fs');
let file = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

// Add import Shield if needed
if (!file.includes('Shield')) {
  file = file.replace("Smartphone } from 'lucide-react'", "Smartphone, Shield } from 'lucide-react'");
}

// Add state
file = file.replace("const [uploadType, setUploadType] = useState<'html'|'css'|'js'>('html')", "const [uploadType, setUploadType] = useState<'html'|'css'|'js'>('html')\n  const [isProtectionEnabled, setIsProtectionEnabled] = useState(false)");

// Load existing state
file = file.replace("setWhatsappNumber(data.whatsappNumber || '');", "setWhatsappNumber(data.whatsappNumber || '');\n            setIsProtectionEnabled(data.isProtectionEnabled || false);");

// Inject into HTML
const protectCode = `
    let protectInjection = '';
    if (isProtectionEnabled) {
      protectInjection = \`
<style>
/* Proteção Anti-Cópia GhostMarket */
body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
</style>
<script>
// Proteção Anti-Cópia GhostMarket
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p' || e.key === 'C' || e.key === 'U' || e.key === 'S' || e.key === 'P')) e.preventDefault();
  if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();
  if (e.key === 'F12') e.preventDefault();
});
</script>\`;
    }
`;

// wait, getCombinedHtml uses replace.
// Let's modify getCombinedHtml correctly.
file = file.replace("const getCombinedHtml = () => {\n    let finalHtml = htmlContent || ''", "const getCombinedHtml = () => {\n    let finalHtml = htmlContent || ''\n" + protectCode);

// where does it inject CSS?
// `finalHtml = finalHtml.replace('<!-- CSS_INJECT -->', \`<style>\${cssContent}</style>\`)`
// Let's add protectInjection there.
file = file.replace("finalHtml = finalHtml.replace('<!-- CSS_INJECT -->', `<style>${cssContent}</style>`)", "finalHtml = finalHtml.replace('<!-- CSS_INJECT -->', `<style>${cssContent}</style>\\n${protectInjection}`)");
file = file.replace("finalHtml = finalHtml.replace('<!-- CSS_INJECT -->', '')", "finalHtml = finalHtml.replace('<!-- CSS_INJECT -->', protectInjection)");

// Update handlePublish database save
file = file.replace("domainType,\n        userId: user?.uid || 'anonymous',", "domainType,\n        isProtectionEnabled,\n        userId: user?.uid || 'anonymous',");

// Add to UI form
const uiBlock = `
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-2 mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-2 rounded-full"><Shield className="w-5 h-5 text-primary" /></div>
                      <div>
                        <h4 className="text-white font-medium text-sm">Proteção Anti-Cópia</h4>
                        <p className="text-xs text-textSecondary mt-0.5">Bloqueia botão direito, seleção e F12.</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input type="checkbox" className="sr-only peer" checked={isProtectionEnabled} onChange={(e) => setIsProtectionEnabled(e.target.checked)} />
                      <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                  <div className="pt-2 flex justify-end gap-3">`;

file = file.replace('<div className="pt-2 flex justify-end gap-3">', uiBlock);

fs.writeFileSync('src/pages/SiteBuilder.tsx', file, 'utf8');
console.log('Added anti-copy to SiteBuilder');
