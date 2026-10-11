const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, limit } = require('firebase/firestore');

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

const uid = '7KhoWgPL30NfkeSCYXKcjUDolN32';

async function check(col) {
  try {
    const snap = await getDocs(query(collection(db, col), limit(20)));
    console.log(col, snap.size);
    snap.forEach(d => {
      const str = JSON.stringify(d.data());
      if (str.includes(uid) || str.includes('582876')) {
        console.log('FOUND IN ' + col + ':', d.id, str);
      }
    });
  } catch(e) {
    // ignore
  }
}

async function main() {
  const cols = ['users', 'hosted_sites', 'creator_projects', 'leads', 'digitaliza_crm', 'crm_workspaces', 'contracts', 'action_logs', 'notifications'];
  for (const c of cols) {
    await check(c);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
