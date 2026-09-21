const fs = require('fs');
let appContent = fs.readFileSync('src/App.tsx', 'utf8');

appContent = appContent.replace('<Route path="/marketing/ads" element={<AdsGenerator />} />', '<Route path="/marketing/ads" element={<AdsGenerator />} />\\n              <Route path="/offers" element={<OfferIntelligence />} />');
fs.writeFileSync('src/App.tsx', appContent, 'utf8');

let offerContent = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');
offerContent = offerContent.replace('import { Search, TrendingDown, Clock, ExternalLink, Plus, Trash2, Bell, AlertTriangle } from \'lucide-react\'', 'import { Search, TrendingDown, ExternalLink, Trash2, Bell } from \'lucide-react\'');
fs.writeFileSync('src/pages/OfferIntelligence.tsx', offerContent, 'utf8');

console.log('Fixed TS errors');
