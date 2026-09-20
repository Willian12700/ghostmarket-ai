const fs = require('fs');

let sb = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

// 1. Add whatsappNumber state
sb = sb.replace(
  `const [jsContent, setJsContent] = useState('')`,
  `const [jsContent, setJsContent] = useState('')\n  const [whatsappNumber, setWhatsappNumber] = useState('')`
);

// 2. Fetch whatsappNumber in useEffect
sb = sb.replace(
  `setJsContent(data.jsContent || '');`,
  `setJsContent(data.jsContent || '');\n            setWhatsappNumber(data.whatsappNumber || '');`
);

// 3. Save whatsappNumber on publish
sb = sb.replace(
  `jsContent: steps[2].value,`,
  `jsContent: steps[2].value,\n        whatsappNumber,`
);

// 4. Inject WhatsApp button if present
const whatsappHtml = `
  if (whatsappNumber.trim()) {
    const waClean = whatsappNumber.replace(/\\D/g, '');
    const waBtn = \`<a href="https://wa.me/\${waClean}?text=Ol%C3%A1!" target="_blank" style="position:fixed;bottom:20px;right:20px;background-color:#25d366;color:white;border-radius:50px;width:60px;height:60px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.3);z-index:9999;text-decoration:none;"><svg viewBox="0 0 24 24" width="35" height="35" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133-.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg></a>\`;
    
    if (finalHtml.includes('</body>')) {
      finalHtml = finalHtml.replace('</body>', waBtn + '\\n</body>');
    } else {
      finalHtml += waBtn;
    }
  }
`;

sb = sb.replace(
  `return finalHtml`,
  `${whatsappHtml}\n    return finalHtml`
);

// 5. Add Input field in Step 4 UI
const whatsappUI = `
                <div className="w-full flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
                  <h3 className="text-xl font-bold text-white">Preview Final</h3>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center bg-panel border border-border px-3 py-1.5 rounded-lg w-full md:w-auto">
                      <span className="text-sm font-bold text-[#25d366] mr-2">WhatsApp:</span>
                      <Input 
                        value={whatsappNumber} 
                        onChange={(e) => setWhatsappNumber(e.target.value)} 
                        placeholder="5511999999999" 
                        className="h-8 bg-background border-none w-[140px] text-sm" 
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-panel border border-border p-1 rounded-lg shrink-0">
                      <button onClick={() => setActiveView('desktop')} className={\`p-2 rounded-md transition-all \${activeView === 'desktop' ? 'bg-background text-primary shadow-sm' : 'text-textSecondary hover:text-white'}\`}><Monitor className="w-4 h-4" /></button>
                      <button onClick={() => setActiveView('mobile')} className={\`p-2 rounded-md transition-all \${activeView === 'mobile' ? 'bg-background text-primary shadow-sm' : 'text-textSecondary hover:text-white'}\`}><Smartphone className="w-4 h-4" /></button>
                    </div>
                  </div>
                </div>
`;

sb = sb.replace(
  /<div className="w-full flex justify-between items-center mb-4">.*?<\/div>/s,
  whatsappUI.trim()
);

fs.writeFileSync('src/pages/SiteBuilder.tsx', sb);
