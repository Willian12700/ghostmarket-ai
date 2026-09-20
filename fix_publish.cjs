const fs = require('fs');
let content = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

const startIndex = content.indexOf('const handlePublish = async (e: React.FormEvent) => {');
const endIndex = content.indexOf('  const steps = [');

if (startIndex !== -1 && endIndex !== -1) {
  const newFunc = `const handlePublish = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!domainName.trim()) {
      addToast('Defina um domínio', 'error')
      return
    }

    setIsPublishing(true)
    try {
      const siteId = domainName.toLowerCase().replace(/[^a-z0-9-]/g, '')
      
      // Check for domain collision
      const docRef = doc(db, 'sites', siteId)
      const snap = await getDoc(docRef)
      if (snap.exists() && snap.data().userId !== (user?.uid || 'anonymous')) {
        addToast('Este nome já está sendo usado por outra conta! Escolha outro.', 'error')
        setIsPublishing(false)
        return
      }

      const fullDomain = domainType === 'subdomain' ? \`\${window.location.origin}/s/\${siteId}\` : \`https://\${siteId}\`
      const rawHtml = getCombinedHtml()

      await setDoc(docRef, {
        id: siteId,
        rawHtml,
        htmlContent: steps[0].value,
        cssContent: steps[1].value,
        jsContent: steps[2].value,
        whatsappNumber,
        domain: fullDomain,
        domainType,
        userId: user?.uid || 'anonymous',
        publishedAt: new Date().toISOString()
      })

      addToast('Site hospedado com sucesso!', 'success')
      if (!editId) {
        setPublishedUrl(fullDomain)
      }
    } catch (error) {
      console.error(error)
      addToast('Erro ao publicar', 'error')
    } finally {
      setIsPublishing(false)
    }
  }

`;
  content = content.substring(0, startIndex) + newFunc + content.substring(endIndex);
  fs.writeFileSync('src/pages/SiteBuilder.tsx', content);
  console.log("Patched correctly!");
} else {
  console.log("Could not find boundaries");
}
