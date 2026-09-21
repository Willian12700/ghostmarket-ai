const fs = require('fs');
let content = fs.readFileSync('src/pages/OfferIntelligence.tsx', 'utf8');

const oldQuery = `      const q = query(
        collection(db, 'offer_tracking'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )`;

const newQuery = `      const q = query(
        collection(db, 'offer_tracking'),
        where('userId', '==', user.uid)
      )`;

content = content.replace(oldQuery, newQuery);

// Add sorting in memory
const oldMap = `const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TrackedProduct[]
      setProducts(items)`;

const newMap = `let items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as TrackedProduct[]
      items.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis())
      setProducts(items)`;

content = content.replace(oldMap, newMap);

fs.writeFileSync('src/pages/OfferIntelligence.tsx', content, 'utf8');
console.log('Fixed Firestore Query');
