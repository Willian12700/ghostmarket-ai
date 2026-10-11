const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

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
  const snap = await getDoc(doc(db, 'users', uid));
  console.log('USER DOC BY UID:', snap.exists() ? snap.data() : 'NOT FOUND');

  const snapEmail = await getDoc(doc(db, 'users', 'Teste VIP (582876)'));
  console.log('USER DOC BY EMAIL:', snapEmail.exists() ? snapEmail.data() : 'NOT FOUND');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
