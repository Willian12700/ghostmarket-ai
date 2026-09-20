const fs = require('fs');
let content = fs.readFileSync('src/store/authStore.ts', 'utf8');

const startIdx = content.indexOf('updateUserProfile: async (name, photoURL) => {');
const endIdx = content.indexOf('updateUserPassword: async (newPassword) => {');

if (startIdx !== -1 && endIdx !== -1) {
  const newLogic = `updateUserProfile: async (name, photoURL) => {
    const currentUser = auth.currentUser
    if (currentUser) {
      const isBase64 = photoURL && photoURL.startsWith('data:image');
      
      await updateProfile(currentUser, { 
        displayName: name,
        ...(photoURL !== undefined && !isBase64 ? { photoURL } : {})
      })

      if (isBase64) {
        localStorage.setItem(\`profile_pic_\${currentUser.uid}\`, photoURL);
        try {
          await setDoc(doc(db, 'users', currentUser.email || currentUser.uid), {
            uid: currentUser.uid,
            email: currentUser.email || '',
            name: name,
            photoURL: photoURL,
            lastLogin: new Date().toISOString()
          }, { merge: true });
        } catch(e) {
           console.error(e)
        }
      } else {
         syncUserToFirestore(currentUser)
      }
      
      set((state) => ({
        user: state.user ? { 
          ...state.user, 
          name: name || state.user.name,
          photoURL: photoURL !== undefined ? photoURL : state.user.photoURL
        } : null
      }))
    }
  },
  `;
  content = content.substring(0, startIdx) + newLogic + content.substring(endIdx);
  fs.writeFileSync('src/store/authStore.ts', content);
  console.log("Forced patched!");
} else {
  console.log("Could not find boundaries.");
}
