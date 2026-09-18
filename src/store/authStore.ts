import { create } from 'zustand'
import { auth } from '@/config/firebase'
import { signOut, onAuthStateChanged, User, updateProfile, updatePassword as updateFirebasePassword } from 'firebase/auth'

interface AuthUser {
  name: string
  email: string
  uid: string
  photoURL?: string | null
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
            photoURL: firebaseUser.photoURL || localStorage.getItem(`profile_pic_${firebaseUser.uid}`)
          },
          isAuthenticated: true,
          isLoading: false
        })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    })
  },
  updateUserProfile: async (name, photoURL) => {
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
    }
  },
  updateUserPassword: async (newPassword) => {
    const currentUser = auth.currentUser
    if (currentUser) {
      await updateFirebasePassword(currentUser, newPassword)
    }
  }
}))
