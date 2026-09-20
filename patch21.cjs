const fs = require('fs');

let sb = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

// 1. Imports
sb = sb.replace(
  `import { useState, useRef } from 'react'`,
  `import { useState, useRef, useEffect } from 'react'\nimport { useSearchParams } from 'react-router-dom'\nimport { getDoc } from 'firebase/firestore'\nimport { useAuthStore } from '@/store/authStore'`
);

// 2. Add useAuthStore and useSearchParams
sb = sb.replace(
  `const { addToast } = useToastStore()`,
  `const { addToast } = useToastStore()\n  const { user } = useAuthStore()\n  const [searchParams] = useSearchParams()\n  const editId = searchParams.get('edit')`
);

// 3. useEffect to fetch existing site
const useEffectCode = `
  useEffect(() => {
    if (editId) {
      const fetchSite = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'sites', editId));
          if (docSnap.exists()) {
            const data = docSnap.data();
            setHtmlContent(data.htmlContent || data.rawHtml || '');
            setCssContent(data.cssContent || '');
            setJsContent(data.jsContent || '');
            setDomainName(data.id);
            if (data.domainType) setDomainType(data.domainType);
          }
        } catch (e) {
          console.error(e);
        }
      };
      fetchSite();
    }
  }, [editId]);
`;
sb = sb.replace(
  `const [uploadType, setUploadType] = useState<'html'|'css'|'js'>('html')`,
  `const [uploadType, setUploadType] = useState<'html'|'css'|'js'>('html')\n${useEffectCode}`
);

// 4. Update handlePublish to save separated contents and userId
const newPublishData = `
      await setDoc(doc(db, 'sites', siteId), {
        id: siteId,
        rawHtml,
        htmlContent: steps[0].value,
        cssContent: steps[1].value,
        jsContent: steps[2].value,
        domain: fullDomain,
        domainType,
        userId: user?.uid || 'anonymous',
        publishedAt: new Date().toISOString()
      })
`;
sb = sb.replace(
  /await setDoc\(doc\(db, 'sites', siteId\), \{[\s\S]*?publishedAt: new Date\(\)\.toISOString\(\)\s*\}\)/,
  newPublishData.trim()
);

fs.writeFileSync('src/pages/SiteBuilder.tsx', sb);
