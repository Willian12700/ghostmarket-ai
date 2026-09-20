const fs = require('fs');
let content = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

// Replace Instagram icon with Smartphone icon
content = content.replace("import { Search, MapPin, Phone, Smartphone, Filter, ShieldAlert, Check, Plus, MessageSquare, Globe as GlobeIcon, Star, Instagram, Sparkles, X } from 'lucide-react'", "import { Search, MapPin, Phone, Smartphone, Filter, ShieldAlert, Check, Plus, MessageSquare, Globe as GlobeIcon, Star, Sparkles, X } from 'lucide-react'");
content = content.replace("<Instagram className=\"w-4 h-4 mr-1\" /> Ver Insta", "<Smartphone className=\"w-4 h-4 mr-1\" /> Ver Insta");

// Fix addContract payload
const oldPayload = `status: 'prospeccao',
        phone: lead.phone,
        city: lead.city,
        instagram: lead.instagram`;
const newPayload = `date: new Date().toISOString().split('T')[0],
        status: 'Lead',
        phone: lead.phone,
        city: lead.city,
        instagram: lead.instagram`;

content = content.replace(oldPayload, newPayload);

fs.writeFileSync('src/pages/Scanner.tsx', content, 'utf8');
console.log('Fixed build errors');
