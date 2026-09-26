const fs = require('fs');

let authCode = fs.readFileSync('src/store/authStore.ts', 'utf8');

// The line is: photoURL: firebaseUser.photoURL || localStorage.getItem(`profile_pic_${firebaseUser.uid}`)
authCode = authCode.replace(/photoURL: firebaseUser\.photoURL \|\| localStorage\.getItem\(\`profile_pic_\$\{firebaseUser\.uid\}\`\)/g, 
  "photoURL: firebaseUser.photoURL || localStorage.getItem(`profile_pic_${firebaseUser.uid}`),\n              isAnonymous: firebaseUser.isAnonymous");

fs.writeFileSync('src/store/authStore.ts', authCode, 'utf8');
