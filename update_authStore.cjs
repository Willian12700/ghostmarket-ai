const fs = require('fs');

let content = fs.readFileSync('src/store/authStore.ts', 'utf8');

const replacement = const syncUserToFirestore = async (user: User) => {
  if (user.isAnonymous) return; // Evita salvar no banco antes de validar o código de teste
  
  try {
    const { getDoc } = require('firebase/firestore');
    // ... wait, getDoc is already imported at the top? Let's check imports first.
;
// Let's just do it with RegExp
content = content.replace(
  /const syncUserToFirestore = async \(user: User\) => \{\n    if \(user\.isAnonymous\) return; \/\/ Evita salvar no banco antes de validar o código de teste\n    \n    try \{\n      await setDoc\(doc\(db, 'users', user\.email \|\| user\.uid\), \{\n        uid: user\.uid,\n        email: user\.email \|\| '',\n        name: user\.displayName \|\| user\.email\?\.split\('@'\)\[0\] \|\| 'User',\n        photoURL: user\.photoURL \|\| '',\n        lastLogin: new Date\(\)\.toISOString\(\)\n      \}, \{ merge: true \}\)\n    \} catch\(e\) \{\n      console\.error\('Error syncing user', e\)\n    \}\n  \}/g,
  const syncUserToFirestore = async (user: User) => {
    if (user.isAnonymous) return;
    
    try {
      const userRef = doc(db, 'users', user.email || user.uid);
      const { getDoc } = await import('firebase/firestore'); // ensure getDoc is available
      const snap = await getDoc(userRef);
      
      let utmData = {};
      if (!snap.exists()) {
        utmData = {
          utm_source: localStorage.getItem('utm_source') || 'direto',
          utm_medium: localStorage.getItem('utm_medium') || '',
          utm_campaign: localStorage.getItem('utm_campaign') || ''
        };
      }
      
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email || '',
        name: user.displayName || user.email?.split('@')[0] || 'User',
        photoURL: user.photoURL || '',
        lastLogin: new Date().toISOString(),
        ...utmData
      }, { merge: true });
    } catch(e) {
      console.error('Error syncing user', e);
    }
  }
);
fs.writeFileSync('src/store/authStore.ts', content, 'utf8');
