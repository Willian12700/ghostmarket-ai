const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit } = require('firebase/firestore');

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
  const possible = ['errors', 'error_logs', 'system_errors', 'client_errors', 'logs', 'action_logs', 'checkout_clicks', 'quiz_sessions'];
  for (const p of possible) {
    try {
      const snap = await getDocs(collection(db, p));
      console.log(p, 'count:', snap.size);
      snap.forEach(d => console.log('  ', d.id, JSON.stringify(d.data()).slice(0, 100)));
    } catch(e) {
      console.log(p, 'error:', e.message);
    }
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
