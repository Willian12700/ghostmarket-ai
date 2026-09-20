const fs = require('fs');

let hs = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// 1. Add states for Redirect Modal
hs = hs.replace(
  `const [search, setSearch] = useState('')`,
  `const [search, setSearch] = useState('')\n  const [isRedirectModalOpen, setIsRedirectModalOpen] = useState(false)\n  const [redirectDest, setRedirectDest] = useState('')\n  const [redirectSlug, setRedirectSlug] = useState('')\n  const [isCreatingRedirect, setIsCreatingRedirect] = useState(false)`
);

// 2. Add Link2 icon and setDoc import
hs = hs.replace(
  `import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'`,
  `import { collection, query, where, getDocs, deleteDoc, doc, setDoc } from 'firebase/firestore'`
);

hs = hs.replace(
  `import { Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp } from 'lucide-react'`,
  `import { Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp, Link2 } from 'lucide-react'`
);

hs = hs.replace(
  `domainType: string;\n  views?: number;`,
  `domainType: string;\n  views?: number;\n  isRedirect?: boolean;\n  redirectUrl?: string;`
);

// 3. Add handleCreateRedirect function
const handleRedirectFn = `
  const handleCreateRedirect = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!redirectDest || !redirectSlug) return
    setIsCreatingRedirect(true)
    try {
      const siteId = redirectSlug.toLowerCase().replace(/[^a-z0-9-]/g, '')
      await setDoc(doc(db, 'sites', siteId), {
        id: siteId,
        redirectUrl: redirectDest,
        isRedirect: true,
        domain: \`\${window.location.origin}/s/\${siteId}\`,
        domainType: 'subdomain',
        userId: user?.uid,
        publishedAt: new Date().toISOString()
      })
      addToast('Link camuflado com sucesso!', 'success')
      setIsRedirectModalOpen(false)
      fetchSites()
    } catch(e) {
      console.error(e)
      addToast('Erro ao criar link', 'error')
    } finally {
      setIsCreatingRedirect(false)
    }
  }
`;

hs = hs.replace(
  `const handleDelete = async (id: string) => {`,
  `${handleRedirectFn}\n\n  const handleDelete = async (id: string) => {`
);

// 4. Update Header Buttons
hs = hs.replace(
  `<Button onClick={() => navigate('/builder')} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">\n            <Plus className="w-4 h-4 mr-2" /> Hospedar Novo Site\n          </Button>`,
  `<div className="flex gap-3">
            <Button variant="secondary" onClick={() => setIsRedirectModalOpen(true)} className="border-primary/50 text-primary hover:bg-primary/10">
              <Link2 className="w-4 h-4 mr-2" /> Camuflar Link
            </Button>
            <Button onClick={() => navigate('/builder')} className="bg-primary hover:bg-primary/90 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Plus className="w-4 h-4 mr-2" /> Hospedar Novo Site
            </Button>
          </div>`
);

// 5. Update Card to show "Link Camuflado" instead of Globe if isRedirect
hs = hs.replace(
  `<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">\n                          <Globe className="w-6 h-6" />\n                        </div>`,
  `{site.isRedirect ? (
                          <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500" title="Link Camuflado">
                            <Link2 className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary" title="Landing Page Hospedada">
                            <Globe className="w-6 h-6" />
                          </div>
                        )}`
);

// 6. Add Modal JSX at the end
const modalJSX = `
      <AnimatePresence>
        {isRedirectModalOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-panel border border-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2"><Link2 className="w-5 h-5 text-pink-500" /> Camuflador Anti-Ban</h3>
                <button onClick={() => setIsRedirectModalOpen(false)} className="text-textSecondary hover:text-white transition-colors">x</button>
              </div>
              <form onSubmit={handleCreateRedirect} className="p-6 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Link Feio (Hotmart, Kiwify, etc)</label>
                  <Input value={redirectDest} onChange={(e) => setRedirectDest(e.target.value)} placeholder="https://pay.kiwify.com.br/12345" required type="url" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Link Camuflado Desejado</label>
                  <div className="flex relative items-center">
                    <span className="absolute left-4 text-textSecondary text-sm font-medium pointer-events-none">.../s/</span>
                    <Input value={redirectSlug} onChange={(e) => setRedirectSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="oferta-vip" className="pl-[60px]" required />
                  </div>
                </div>
                <div className="pt-2 flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setIsRedirectModalOpen(false)}>Cancelar</Button>
                  <Button type="submit" disabled={isCreatingRedirect} className="shadow-[0_0_15px_rgba(236,72,153,0.3)] bg-pink-500 hover:bg-pink-600 text-white">{isCreatingRedirect ? 'Criando...' : 'Criar Link'}</Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
`;

hs = hs.replace(`</div>\n    </div>\n  )\n}`, `</div>\n${modalJSX}\n    </div>\n  )\n}`);

fs.writeFileSync('src/pages/HostedSites.tsx', hs);
