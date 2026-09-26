const fs = require('fs');
let hs = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

hs = hs.replace(/<button onClick=\{\(\) => \{\r?\n\s*const url = `\$\{window.location.origin\}\/report/, 
`                          {!site.isRedirect && site.rawHtml && (
                            <button onClick={() => handleDownloadZip(site)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Baixar ZIP">
                              <Download className="w-4 h-4" />
                            </button>
                          )}\n$&`);

fs.writeFileSync('src/pages/HostedSites.tsx', hs);
