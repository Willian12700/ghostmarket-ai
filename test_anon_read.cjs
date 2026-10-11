const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, limit, query } = require('firebase/firestore');
const { getAuth, signInAnonymously } = require('firebase/auth');

const firebaseConfig = {
  apiKey: "AIzaSyDafvRbIgwriRgCis2sAmJeJ80RHmn30LA",
  authDomain: "ghostmarket-ai-2cc26.firebaseapp.com",
  projectId: "ghostmarket-ai-2cc26",
  storageBucket: "ghostmarket-ai-2cc26.firebasestorage.app",
  messagingSenderId: "127761760560",
  appId: "1:127761760560:web:78f323a283351f342908f5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function main() {
  await signInAnonymously(auth);
  console.log('Anon signed in!');

  const cols = ['users', 'transactions', 'sites', 'chatbots', 'notifications', 'contracts', 'digitaliza_crm', 'crm_workspaces', 'crm_workspace_members'];
  for (const c of cols) {
    try {
      const snap = await getDocs(query(collection(db, c), limit(2)));
      console.log('Read ' + c + ': OK (' + snap.size + ' docs)');
    } catch(e) {
      console.error('Read ' + c + ': FAILED -> ' + e.message);
    }
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
