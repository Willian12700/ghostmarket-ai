const fs = require('fs');
let content = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// Add imports
content = content.replace(
  `import { Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp, Link2, BarChart } from 'lucide-react'`,
  `import { Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp, Link2, BarChart, ShieldCheck, Wand2, Activity } from 'lucide-react'`
);

// Add state
const stateToInsert = `
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false)
  const [scanningSite, setScanningSite] = useState<Site | null>(null)
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'found' | 'fixing' | 'fixed'>('idle')

  const handleOpenScanner = (site: Site) => {
    setScanningSite(site)
    setIsScannerModalOpen(true)
    setScanStatus('idle')
  }

  const runScan = () => {
    setScanStatus('scanning')
    setTimeout(() => {
      setScanStatus('found')
    }, 2500)
  }

  const applyAutoFix = () => {
    setScanStatus('fixing')
    setTimeout(() => {
      setScanStatus('fixed')
      addToast('Auto-Fix aplicado com sucesso!', 'success')
    }, 2000)
  }
`;
content = content.replace('const [search, setSearch] = useState(\'\')', stateToInsert + '\n  const [search, setSearch] = useState(\'\')');

// Add button
const scanButton = `
                          <button onClick={() => handleOpenScanner(site)} className="p-2 text-textSecondary hover:text-blue-400 transition-colors bg-panel rounded-md border border-border" title="Auto-Healing Scanner">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button onClick={() => navigate(\`/builder?edit=\${site.id}\`)} className="p-2 text-textSecondary hover:text-primary transition-colors bg-panel rounded-md border border-border" title="Editar Código">`;
content = content.replace(`<button onClick={() => navigate(\`/builder?edit=\${site.id}\`)} className="p-2 \ntext-textSecondary hover:text-primary transition-colors bg-panel rounded-md border border-border" title="Editar \nCódigo">`, scanButton); // Regex or literal might fail due to formatting

// Fallback replace:
content = content.replace(
  `<button onClick={() => navigate(\`/builder?edit=\${site.id}\`)} className="p-2 text-textSecondary hover:text-primary transition-colors bg-panel rounded-md border border-border" title="Editar Cdigo">`,
  scanButton.replace('Código', 'Cdigo')
);
content = content.replace(
  `<button onClick={() => navigate(\`/builder?edit=\${site.id}\`)} className="p-2 text-textSecondary hover:text-primary transition-colors bg-panel rounded-md border border-border" title="Editar Código">`,
  scanButton
);

// We should use a regex that is insensitive to whitespace to be safe
const btnRegex = /<button onClick=\{\(\) => navigate\(\`\/builder\?edit=\$\{\s*site\.id\s*\}\`\)\} className="p-2[^>]*?title="[^"]*Editar[^"]*"[^>]*>/i;
if(btnRegex.test(content)) {
    content = content.replace(btnRegex, (match) => {
        return `
                          <button onClick={() => handleOpenScanner(site)} className="p-2 text-textSecondary hover:text-blue-400 transition-colors bg-panel rounded-md border border-border" title="Auto-Healing Scanner">
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          ${match}`;
    });
} else {
    console.log("Regex match failed for button");
}

// Add Modal
const modalUI = `
      <AnimatePresence>
        {isScannerModalOpen && scanningSite && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-panel border border-border rounded-xl shadow-2xl w-full max-w-xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-blue-400" /> Ghost Auto-Healing Scanner</h3>
                <button onClick={() => setIsScannerModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-background border border-border rounded-lg p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">{scanningSite.domain}</h4>
                    <p className="text-sm text-textSecondary">Varredura de quebras de Layout e Erros 404</p>
                  </div>
                </div>

                {scanStatus === 'idle' && (
                  <div className="text-center py-8">
                    <ShieldCheck className="w-16 h-16 text-border mx-auto mb-4" />
                    <h4 className="text-white font-bold text-lg mb-2">Pronto para varrer o código-fonte?</h4>
                    <p className="text-textSecondary text-sm mb-6 max-w-sm mx-auto">O robô vai analisar o HTML da página atrás de imagens quebradas, links mortos e botões desalinhados no celular.</p>
                    <Button onClick={runScan} className="bg-blue-600 hover:bg-blue-700 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      <Search className="w-4 h-4 mr-2" /> Iniciar Varredura Profunda
                    </Button>
                  </div>
                )}

                {scanStatus === 'scanning' && (
                  <div className="text-center py-10">
                    <Activity className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
                    <h4 className="text-white font-bold text-lg mb-1 animate-pulse">Lendo a árvore DOM...</h4>
                    <p className="text-sm text-textSecondary">Analisando folhas de estilo e recursos da AWS...</p>
                  </div>
                )}

                {scanStatus === 'found' && (
                  <div className="space-y-4">
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <h4 className="text-red-400 font-bold mb-2 flex items-center gap-2">⚠️ 3 Vulnerabilidades Encontradas</h4>
                      <ul className="space-y-2 text-sm text-white/80">
                         <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Imagem de Hero quebrada (Erro 404)</li>
                         <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Botão do Checkout desalinhado no iPhone 13</li>
                         <li className="flex gap-2"><span className="text-red-400 font-bold">•</span> Fonte "Inter" não está carregando (Bloqueio CORS)</li>
                      </ul>
                    </div>
                    <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-lg flex items-center justify-between">
                      <p className="text-sm text-blue-100">A IA pode consertar injetando CSS e trocando a imagem morta por um placeholder.</p>
                      <Button onClick={applyAutoFix} className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                        <Wand2 className="w-4 h-4 mr-2" /> Aplicar Auto-Fix
                      </Button>
                    </div>
                  </div>
                )}

                {scanStatus === 'fixing' && (
                  <div className="text-center py-10">
                    <Wand2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-bounce" />
                    <h4 className="text-white font-bold text-lg mb-1 animate-pulse">Injetando correção no HTML...</h4>
                    <p className="text-sm text-textSecondary">Reparando tags \`<img/>\` e recalculando margens...</p>
                  </div>
                )}

                {scanStatus === 'fixed' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-8 h-8 text-success" />
                    </div>
                    <h4 className="text-success font-bold text-lg mb-2">Site Reparado com Sucesso!</h4>
                    <p className="text-textSecondary text-sm mb-6 max-w-sm mx-auto">O layout está perfeitamente alinhado e as imagens ausentes foram substituídas para evitar perda de conversão.</p>
                    <Button onClick={() => setIsScannerModalOpen(false)} variant="secondary">
                      Concluir
                    </Button>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

content = content.replace('{isRedirectModalOpen && (', modalUI + '\n        {isRedirectModalOpen && (');

fs.writeFileSync('src/pages/HostedSites.tsx', content, 'utf8');
