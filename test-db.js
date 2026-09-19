import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

const db = getFirestore();

async function check() {
  const snapshot = await db.collection('transactions').get();
  console.log('Total transactions:', snapshot.size);
  snapshot.forEach(doc => {
    console.log(doc.id, doc.data());
  });
}
check();
