const fs = require('fs');
let content = fs.readFileSync('src/store/authStore.ts', 'utf8');

const target = `    updateUserProfile: async (name, photoURL) => {
      const currentUser = auth.currentUser
      if (currentUser) {
        await updateProfile(currentUser, { 
          displayName: name,
          ...(photoURL !== undefined && { photoURL })
        })
        
        set((state) => ({
          user: state.user ? { 
            ...state.user, 
            name: name || state.user.name,
            photoURL: photoURL !== undefined ? photoURL : state.user.photoURL
          } : null
        }))
        
        syncUserToFirestore(currentUser)
      }
    },`;

const newLogic = `    updateUserProfile: async (name, photoURL) => {
      const currentUser = auth.currentUser
      if (currentUser) {
        // Firebase Auth doesn't accept large base64 strings in photoURL.
        // If it's a base64 string, we save to localStorage and skip updateProfile for the photo.
        const isBase64 = photoURL && photoURL.startsWith('data:image');
        
        await updateProfile(currentUser, { 
          displayName: name,
          ...(photoURL !== undefined && !isBase64 && { photoURL })
        })

        if (isBase64) {
          localStorage.setItem(\`profile_pic_\${currentUser.uid}\`, photoURL);
          // Also manually update the users collection document with the base64 string
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
           // Normal sync
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
    },`;

if (content.includes("await updateProfile(currentUser, {")) {
  content = content.replace(target, newLogic);
  fs.writeFileSync('src/store/authStore.ts', content);
  console.log("Patched authStore!");
} else {
  console.log("Could not find logic");
}
