const fs = require('fs');

let sb = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

// 1. Add publishedUrl state
sb = sb.replace(
  `const [isPublishing, setIsPublishing] = useState(false)`,
  `const [isPublishing, setIsPublishing] = useState(false)\n  const [publishedUrl, setPublishedUrl] = useState('')`
);

// 2. Fix the domain logic
sb = sb.replace(
  `const fullDomain = domainType === 'subdomain' ? \`\${siteId}.ghostmarket.ai\` : siteId`,
  `const fullDomain = domainType === 'subdomain' ? \`\${window.location.origin}/s/\${siteId}\` : \`https://\${siteId}\``
);

// 3. Set published URL on success instead of closing modal immediately
sb = sb.replace(
  `addToast('Site hospedado com sucesso!', 'success')\n      setIsPublishModalOpen(false)`,
  `addToast('Site hospedado com sucesso!', 'success')\n      setPublishedUrl(fullDomain)`
);

// 4. Update the form to handle Link Gratuito and Success State
const formLogic = `
              {publishedUrl ? (
                <div className="p-6 space-y-6 text-center">
                  <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Seu site está no ar!</h3>
                  <p className="text-textSecondary">Acesse agora mesmo através do link abaixo:</p>
                  
                  <div className="bg-background border border-border p-3 rounded-lg flex items-center justify-between gap-4">
                    <span className="text-primary font-mono text-sm truncate">{publishedUrl}</span>
                    <Button size="sm" onClick={() => { navigator.clipboard.writeText(publishedUrl); addToast('Link copiado!', 'success') }}>Copiar</Button>
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <Button variant="ghost" className="flex-1" onClick={() => { setIsPublishModalOpen(false); setPublishedUrl(''); }}>Fechar</Button>
                    <a href={publishedUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full bg-green-500 hover:bg-green-600 text-white">Acessar Site</Button>
                    </a>
                  </div>
                </div>
              ) : (
                <form onSubmit={handlePublish} className="p-6 space-y-6">
                  <div className="flex p-1 bg-background border border-border rounded-lg">
                    <button type="button" onClick={() => setDomainType('subdomain')} className={\`flex-1 py-2 text-sm font-medium rounded-md transition-colors \${domainType === 'subdomain' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}\`}>Link Gratuito</button>
                    <button type="button" onClick={() => setDomainType('custom')} className={\`flex-1 py-2 text-sm font-medium rounded-md transition-colors \${domainType === 'custom' ? 'bg-panel text-white shadow-sm' : 'text-textSecondary hover:text-white'}\`}>Domínio Próprio</button>
                  </div>
                  {domainType === 'subdomain' ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-textSecondary">Escolha a URL da sua Landing Page</label>
                      <div className="flex relative items-center">
                        <span className="absolute left-4 text-textSecondary text-sm font-medium pointer-events-none">{window.location.host}/s/</span>
                        <Input value={domainName} onChange={(e) => setDomainName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="meu-negocio" className="pl-[200px]" />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2"><label className="text-sm font-medium text-textSecondary">Seu Domínio</label><Input value={domainName} onChange={(e) => setDomainName(e.target.value.toLowerCase())} placeholder="www.meusite.com.br" /></div>
                    </div>
                  )}
                  <div className="pt-2 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsPublishModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isPublishing} className="shadow-[0_0_15px_rgba(139,92,246,0.3)] bg-primary text-white">{isPublishing ? 'Hospedando...' : 'Colocar no Ar Agora'}</Button>
                  </div>
                </form>
              )}
`;

const regexForm = /<form onSubmit=\{handlePublish\}.*?<\/form>/s;
sb = sb.replace(regexForm, formLogic.trim());

// Update close button handler to also clear publishedUrl
sb = sb.replace(
  `onClick={() => setIsPublishModalOpen(false)} className="text-textSecondary`,
  `onClick={() => { setIsPublishModalOpen(false); setPublishedUrl(''); }} className="text-textSecondary`
);

fs.writeFileSync('src/pages/SiteBuilder.tsx', sb);
