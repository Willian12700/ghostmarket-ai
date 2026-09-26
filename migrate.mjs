import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDafvRbIgwriRgCis2sAmJeJ80RHmn30LA",
  authDomain: "ghostmarket-ai-2cc26.firebaseapp.com",
  projectId: "ghostmarket-ai-2cc26",
  storageBucket: "ghostmarket-ai-2cc26.firebasestorage.app",
  messagingSenderId: "127761760560",
  appId: "1:127761760560:web:78f323a283351f342908f5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function migrate() {
  console.log("Starting migration...");
  const sitesRef = collection(db, "sites");
  const snap = await getDocs(sitesRef);
  
  let count = 0;
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    if (data.domain) {
      let newDomain = data.domain;
      let changed = false;
      
      if (newDomain.includes("ghostmarket-ai.vercel.app")) {
        newDomain = newDomain.replace(/ghostmarket-ai\.vercel\.app/g, "ghostmarket.cyou");
        changed = true;
      }
      if (newDomain.includes("localhost:5173")) {
        newDomain = newDomain.replace(/localhost:5173/g, "ghostmarket.cyou");
        changed = true;
      }
      
      if (changed) {
        await updateDoc(doc(db, "sites", docSnap.id), {
          domain: newDomain
        });
        console.log(`Updated ${docSnap.id}: ${data.domain} -> ${newDomain}`);
        count++;
      }
    }
  }
  
  console.log(`Migration complete! Updated ${count} sites.`);
  process.exit(0);
}

migrate().catch(console.error);
