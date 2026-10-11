const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

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

async function main() {
  const uid = '7KhoWgPL30NfkeSCYXKcjUDolN32';
  const email = '';
  console.log('Testing query with [uid, email]...');
  const q = query(collection(db, 'notifications'), where('userId', 'in', [uid, email]));
  const snap = await getDocs(q);
  console.log('Query success! Docs count:', snap.size);
}

main().then(() => process.exit(0)).catch(e => { console.error('Query threw:', e); process.exit(1); });
