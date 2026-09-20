const fs = require('fs');

let authStore = fs.readFileSync('src/store/authStore.ts', 'utf8');

const syncUserCode = `import { doc, setDoc } from 'firebase/firestore'
import { db } from '@/config/firebase'

const syncUserToFirestore = async (user: User) => {
  try {
    await setDoc(doc(db, 'users', user.email || user.uid), {
      uid: user.uid,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL || '',
      lastLogin: new Date().toISOString()
    }, { merge: true })
  } catch(e) {
    console.error('Error syncing user', e)
  }
}`;

authStore = authStore.replace(
  `import { signOut, onAuthStateChanged, User, updateProfile, updatePassword as updateFirebasePassword } from 'firebase/auth'`,
  `import { signOut, onAuthStateChanged, User, updateProfile, updatePassword as updateFirebasePassword } from 'firebase/auth'\n${syncUserCode}`
);

authStore = authStore.replace(
  `isAuthenticated: true,\n          isLoading: false\n        })`,
  `isAuthenticated: true,\n          isLoading: false\n        })\n        syncUserToFirestore(firebaseUser)`
);

fs.writeFileSync('src/store/authStore.ts', authStore);
