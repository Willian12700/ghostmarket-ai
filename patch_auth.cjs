const fs = require('fs');

let store = fs.readFileSync('src/store/authStore.ts', 'utf8');

const targetListener = `    initAuthListener: () => {
      onAuthStateChanged(auth, (firebaseUser: User | null) => {
        if (firebaseUser) {
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL || localStorage.getItem(\`profile_pic_\${firebaseUser.uid}\`)
            },
            isAuthenticated: true,
            isLoading: false
          })
          syncUserToFirestore(firebaseUser)
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      })
    },`;

const newListener = `    initAuthListener: () => {
      onAuthStateChanged(auth, async (firebaseUser: User | null) => {
        if (firebaseUser) {
          
          try {
            const { getDoc, doc } = await import('firebase/firestore');
            const userDocSnap = await getDoc(doc(db, 'users', firebaseUser.email || firebaseUser.uid));
            const userData = userDocSnap.data();

            if (userData && userData.isSuspended) {
              await signOut(auth);
              set({ user: null, isAuthenticated: false, isLoading: false });
              alert("Sua conta foi suspensa por violação dos termos ou falta de pagamento. Entre em contato com o suporte.");
              window.location.href = '/login';
              return;
            }
          } catch(e) {
            console.error("Erro ao verificar status da conta", e);
          }

          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL || localStorage.getItem(\`profile_pic_\${firebaseUser.uid}\`)
            },
            isAuthenticated: true,
            isLoading: false
          })
          syncUserToFirestore(firebaseUser)
        } else {
          set({ user: null, isAuthenticated: false, isLoading: false })
        }
      })
    },`;

if(store.includes("initAuthListener: () => {")) {
  store = store.replace(targetListener, newListener);
  fs.writeFileSync('src/store/authStore.ts', store, 'utf8');
  console.log('Patched authStore!');
}
