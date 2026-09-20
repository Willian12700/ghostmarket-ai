const fs = require('fs');

let sb = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

// 1. Update handlePublish
const oldHandlePublish = `  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!domainName.trim()) {
      addToast('Defina um domínio', 'error')
      return
    }

    setIsPublishing(true)
    try {
      const siteId = domainName.toLowerCase().replace(/[^a-z0-9-]/g, '')
      const fullDomain = domainType === 'subdomain' ? \`\${window.location.origin}/s/\${siteId}\` : \`https://\${siteId}\`
      
      const rawHtml = getCombinedHtml()`;

const newHandlePublish = `  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId && !domainName.trim()) {
      addToast('Defina um domínio', 'error')
      return
    }

    setIsPublishing(true)
    try {
      const siteId = editId || domainName.toLowerCase().replace(/[^a-z0-9-]/g, '')
      
      if (!editId) {
        const docRef = doc(db, 'sites', siteId)
        const snap = await getDoc(docRef)
        if (snap.exists()) {
          addToast('Este domínio já está em uso por outro usuário! Escolha outro nome.', 'error')
          setIsPublishing(false)
          return
        }
      }

      const fullDomain = domainType === 'subdomain' ? \`\${window.location.origin}/s/\${siteId}\` : \`https://\${siteId}\`
      
      const rawHtml = getCombinedHtml()`;

sb = sb.replace(oldHandlePublish, newHandlePublish);

// 2. Update Modal UI
const oldForm = `<form onSubmit={handlePublish} className="p-6 space-y-6">
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
                </form>`;

const newForm = `editId ? (
                <form onSubmit={handlePublish} className="p-6 space-y-6 text-center">
                  <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                    <Globe className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Atualizar Site</h3>
                  <p className="text-textSecondary">Você está editando o site <strong className="text-white">{editId}</strong>. Deseja publicar as novas alterações?</p>
                  <div className="pt-4 flex gap-3">
                    <Button type="button" variant="ghost" className="flex-1 border border-border" onClick={() => setIsPublishModalOpen(false)}>Cancelar</Button>
                    <Button type="submit" disabled={isPublishing} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]">{isPublishing ? 'Atualizando...' : 'Publicar Atualização'}</Button>
                  </div>
                </form>
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
              )`;

sb = sb.replace(oldForm, newForm);

fs.writeFileSync('src/pages/SiteBuilder.tsx', sb);
