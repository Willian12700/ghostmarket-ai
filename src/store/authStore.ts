import { create } from 'zustand'
import { auth } from '@/config/firebase'
import { signOut, onAuthStateChanged, User, updateProfile, updatePassword as updateFirebasePassword } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
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
}

interface AuthUser {
  name: string
  email: string
  uid: string
  photoURL?: string | null
  isAnonymous?: boolean
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: AuthUser | null) => void
  logout: () => Promise<void>
  initAuthListener: () => void
  updateUserProfile: (name: string, photoURL?: string) => Promise<void>
  updateUserPassword: (newPassword: string) => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  logout: async () => {
    await signOut(auth)
    set({ user: null, isAuthenticated: false })
  },
  initAuthListener: () => {
    onAuthStateChanged(auth, (firebaseUser: User | null) => {
      if (firebaseUser) {
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL || localStorage.getItem(`profile_pic_${firebaseUser.uid}`),
              isAnonymous: firebaseUser.isAnonymous
          },
          isAuthenticated: true,
          isLoading: false
        })
        syncUserToFirestore(firebaseUser)
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    })
  },
  updateUserProfile: async (name, photoURL) => {
    const currentUser = auth.currentUser
    if (currentUser) {
      const isBase64 = photoURL && photoURL.startsWith('data:image');
      
      await updateProfile(currentUser, { 
        displayName: name,
        ...(photoURL !== undefined && !isBase64 ? { photoURL } : {})
      })

      if (isBase64) {
        localStorage.setItem(`profile_pic_${currentUser.uid}`, photoURL);
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
  updateUserPassword: async (newPassword) => {
    const currentUser = auth.currentUser
    if (currentUser) {
      await updateFirebasePassword(currentUser, newPassword)
    }
  }
}))
