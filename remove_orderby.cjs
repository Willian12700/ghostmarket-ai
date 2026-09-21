const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

content = content.replace('collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp, orderBy', 'collection, addDoc, query, where, getDocs, deleteDoc, doc, serverTimestamp');

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
