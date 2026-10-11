const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
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
  const cred = await signInAnonymously(auth);
  console.log('Signed in anon:', cred.user.uid);
  const ref = await addDoc(collection(db, 'system_errors'), {
    test: true,
    uid: cred.user.uid,
    time: Date.now()
  });
  console.log('Wrote doc:', ref.id);
}

main().then(() => process.exit(0)).catch(e => { console.error('Write failed:', e); process.exit(1); });
