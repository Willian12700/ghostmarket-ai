const fs = require('fs');

let content = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

const target = `      const siteId = domainName.toLowerCase().replace(/[^a-z0-9-]/g, '')
      const fullDomain = domainType === 'subdomain' ? \`\${window.location.origin}/s/\${siteId}\` : \`https://\${siteId}\`
      
      const rawHtml = getCombinedHtml()

      await setDoc(doc(db, 'sites', siteId), {`;

const replacement = `      const siteId = domainName.toLowerCase().replace(/[^a-z0-9-]/g, '')
      
      // Check for domain collision
      const docRef = doc(db, 'sites', siteId)
      const snap = await getDoc(docRef)
      if (snap.exists() && snap.data().userId !== (user?.uid || 'anonymous')) {
        addToast('Este nome já está sendo usado! Por favor, escolha outro.', 'error')
        setIsPublishing(false)
        return
      }

      const fullDomain = domainType === 'subdomain' ? \`\${window.location.origin}/s/\${siteId}\` : \`https://\${siteId}\`
      
      const rawHtml = getCombinedHtml()

      await setDoc(docRef, {`;

content = content.replace(target, replacement);

fs.writeFileSync('src/pages/SiteBuilder.tsx', content);
