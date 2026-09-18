import { create } from 'zustand'
import { auth } from '@/config/firebase'
import { signOut, onAuthStateChanged, User } from 'firebase/auth'

interface AuthState {
  user: { name: string; email: string; uid: string } | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: { name: string; email: string; uid: string } | null) => void
  logout: () => Promise<void>
  initAuthListener: () => void
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
            name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User'
          },
          isAuthenticated: true,
          isLoading: false
        })
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false })
      }
    })
  }
}))
