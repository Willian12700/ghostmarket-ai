const fs = require('fs');

// 1. Update SiteViewer.tsx to increment views
let sv = fs.readFileSync('src/pages/SiteViewer.tsx', 'utf8');
sv = sv.replace(
  `import { doc, getDoc } from 'firebase/firestore'`,
  `import { doc, getDoc, updateDoc, increment } from 'firebase/firestore'`
);

const analyticsLogic = `
        if (docSnap.exists()) {
          const data = docSnap.data()
          
          // Analytics Tracker Invisível
          const visited = sessionStorage.getItem(\`visited_\${siteId}\`)
          if (!visited) {
            try {
              await updateDoc(docRef, { views: increment(1) })
              sessionStorage.setItem(\`visited_\${siteId}\`, 'true')
            } catch(e) { console.error('Analytics err', e) }
          }
          
          if (data.rawHtml) {
`;

sv = sv.replace(
  `        if (docSnap.exists()) {\n          const data = docSnap.data()\n          if (data.rawHtml) {`,
  analyticsLogic
);

fs.writeFileSync('src/pages/SiteViewer.tsx', sv);

// 2. Update HostedSites.tsx to show views
let hs = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

hs = hs.replace(
  `domainType: string;`,
  `domainType: string;\n  views?: number;`
);

hs = hs.replace(
  `import { Globe, Trash2, Edit, ExternalLink, Plus, Search } from 'lucide-react'`,
  `import { Globe, Trash2, Edit, ExternalLink, Plus, Search, Eye, TrendingUp } from 'lucide-react'`
);

const viewsBadge = `
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                          <Globe className="w-6 h-6" />
                        </div>
                        <div className="flex items-center gap-1.5 bg-background border border-border px-2.5 py-1 rounded-md shadow-sm">
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-bold text-white">{site.views || 0}</span>
                        </div>
                      </div>
`;

hs = hs.replace(
  `<div className="flex items-start justify-between mb-4">\n                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">\n                        <Globe className="w-6 h-6" />\n                      </div>`,
  viewsBadge.trim()
);

// Add global stats to top header
const globalStats = `
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-background border border-border p-4 rounded-xl flex items-center justify-between shadow-lg">
              <div>
                <p className="text-xs text-textSecondary mb-1 font-bold">Total de Sites Ativos</p>
                <h3 className="text-3xl font-black text-white">{sites.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                <Globe className="w-6 h-6" />
              </div>
            </div>
            <div className="bg-background border border-border p-4 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-green-500/10 blur-[50px] pointer-events-none" />
              <div className="relative z-10">
                <p className="text-xs text-textSecondary mb-1 font-bold">Total de Acessos (Tráfego)</p>
                <h3 className="text-3xl font-black text-green-400">{sites.reduce((acc, site) => acc + (site.views || 0), 0)}</h3>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center relative z-10 shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
`;

hs = hs.replace(
  `<div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">`,
  globalStats.trim()
);

fs.writeFileSync('src/pages/HostedSites.tsx', hs);
