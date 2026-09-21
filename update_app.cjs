const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

if (!content.includes('OfferIntelligence')) {
    const importStr = "import { OfferIntelligence } from '@/pages/OfferIntelligence'\nimport { ErrorBoundary }";
    content = content.replace("import { ErrorBoundary }", importStr);
    
    const routeStr = `<Route path="/ads" element={<AdsGenerator />} />
            <Route path="/offers" element={<OfferIntelligence />} />`;
    content = content.replace('<Route path="/ads" element={<AdsGenerator />} />', routeStr);
    
    fs.writeFileSync('src/App.tsx', content, 'utf8');
    console.log('App.tsx updated');
}
