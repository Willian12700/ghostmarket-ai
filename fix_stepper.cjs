const fs = require('fs');

let pb = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');
pb = pb.replace('<div className="pt-8 pb-4 px-6 max-w-4xl mx-auto w-full relative z-10">', '<div className="pt-8 pb-4 px-6 max-w-4xl mx-auto w-full relative z-10">\n<CreationStepper currentStep={2} />');
fs.writeFileSync('src/pages/PromptBuilder.tsx', pb);

let sb = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');
sb = sb.replace('<div className="z-10 w-full h-full max-w-5xl p-6 md:p-8 flex flex-col">', '<div className="z-10 w-full h-full max-w-5xl p-6 md:p-8 flex flex-col">\n<CreationStepper currentStep={3} />');
fs.writeFileSync('src/pages/SiteBuilder.tsx', sb);

let cs = fs.readFileSync('src/components/ui/CreationStepper.tsx', 'utf8');
cs = cs.replace(/import \{ motion \} from 'framer-motion'\n/, '');
cs = cs.replace(/, ChevronRight/, '');
fs.writeFileSync('src/components/ui/CreationStepper.tsx', cs);

let hs = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');
hs = hs.replace(/<button onClick=\{\(\) => \{\n\s*const url = `\$\{window.location.origin\}\/report/, 
`                          {!site.isRedirect && site.rawHtml && (
                            <button onClick={() => handleDownloadZip(site)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-primary/10 text-primary transition-colors" title="Baixar ZIP">
                              <Download className="w-4 h-4" />
                            </button>
                          )}\n$&`);
fs.writeFileSync('src/pages/HostedSites.tsx', hs);
