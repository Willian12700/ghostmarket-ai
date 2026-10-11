const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

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
  const snap = await getDocs(collection(db, 'digitaliza_crm'));
  console.log('Total digitaliza_crm docs:', snap.size);
  snap.forEach(d => {
    const data = d.data();
    console.log(d.id, 'status:', data.status, 'date:', data.date, 'type of date:', typeof data.date);
  });
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
