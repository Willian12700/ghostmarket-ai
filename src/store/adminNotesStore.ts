import { create } from 'zustand';
import { db } from '@/config/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy } from 'firebase/firestore';

export interface AdminNote {
  id: string;
  title: string;
  content: string;
  status: 'idea' | 'todo' | 'doing' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tags: string[];
  createdAt: number;
}

interface AdminNotesStore {
  notes: AdminNote[];
  isLoading: boolean;
  syncNotes: () => () => void;
  addNote: (note: Omit<AdminNote, 'id' | 'createdAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<AdminNote>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

export const useAdminNotesStore = create<AdminNotesStore>((set) => ({
  notes: [],
  isLoading: true,
  syncNotes: () => {
    set({ isLoading: true });
    const q = query(collection(db, 'admin_notes'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminNote[];
      set({ notes, isLoading: false });
    }, (error) => {
      console.error("Error syncing admin notes:", error);
      set({ isLoading: false });
    });
    
    return unsubscribe;
  },
  addNote: async (note) => {
    await addDoc(collection(db, 'admin_notes'), {
      ...note,
      createdAt: Date.now()
    });
  },
  updateNote: async (id, updates) => {
    const docRef = doc(db, 'admin_notes', id);
    await updateDoc(docRef, updates);
  },
  deleteNote: async (id) => {
    const docRef = doc(db, 'admin_notes', id);
    await deleteDoc(docRef);
  }
}));
