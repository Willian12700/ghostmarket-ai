const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, orderBy, limit } = require('firebase/firestore');

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
  console.log('--- RECENT TRIAL CODES ---');
  try {
    const qCodes = query(collection(db, 'trial_codes'), limit(10));
    const snapCodes = await getDocs(qCodes);
    snapCodes.forEach(d => {
      console.log(d.id, JSON.stringify(d.data()));
    });
  } catch(e) {
    console.error('Error fetching trial codes:', e);
  }

  console.log('\n--- RECENT ACTION LOGS ---');
  try {
    const qLogs = query(collection(db, 'action_logs'), limit(10));
    const snapLogs = await getDocs(qLogs);
    snapLogs.forEach(d => {
      console.log(d.id, JSON.stringify(d.data()));
    });
  } catch(e) {
    console.error('Error fetching action logs:', e);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
