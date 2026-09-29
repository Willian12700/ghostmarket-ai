import { create } from 'zustand'
import { db } from '@/config/firebase'
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy } from 'firebase/firestore'

export type CRMStatus = 'Novo' | 'Contato' | 'Qualificado' | 'Proposta' | 'Negociação' | 'Fechado' | 'Perdido'

export type CRMPriority = 'baixa' | 'media' | 'alta'

export interface CRMTask {
  id: string
  title: string
  completed: boolean
  dueDate?: string
}

export interface CRMHistoryEntry {
  id: string
  type: 'nota' | 'ligacao' | 'email' | 'mudanca_status' | 'tarefa'
  content: string
  date: string
}

export interface DigitalizaContract {
  id: string
  client: string // Nome do Contato/Lead
  amount: number
  date: string
  status: CRMStatus
  addedByEmail: string
  addedByName: string
  
  // Basic info
  phone?: string
  instagram?: string
  city?: string
  
  // Expanded CRM Info
  email?: string
  company?: string
  role?: string
  
  // Advanced CRM fields
  priority?: CRMPriority
  origin?: string
  lossReason?: string
  lastInteraction?: string
  responsible?: string
  
  tags?: string[]
  tasks?: CRMTask[]
  history?: CRMHistoryEntry[]
}

interface DigitalizaState {
  contracts: DigitalizaContract[]
  isSynced: boolean
  syncContracts: () => () => void
  addContract: (contract: Omit<DigitalizaContract, 'id'>) => Promise<void>
  updateContract: (id: string, data: Partial<Omit<DigitalizaContract, 'id'>>) => Promise<void>
  deleteContract: (id: string) => Promise<void>
}

export const useDigitalizaStore = create<DigitalizaState>()((set) => ({
  contracts: [],
  isSynced: false,

  syncContracts: () => {
    const q = query(
      collection(db, 'digitaliza_crm'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        // Migrate old statuses on the fly if needed (optional, just defaults to 'Novo' or something if mapping is off, but we can handle that in UI or here)
      } as DigitalizaContract))
      
      // Basic migration for old status data in memory to avoid breaking UI before DB update
      const migratedTxs = txs.map(tx => {
        let status = tx.status as any
        if (status === 'Lead') status = 'Novo'
        return { ...tx, status }
      })

      set({ contracts: migratedTxs, isSynced: true })
    })

    return unsubscribe
  },

  addContract: async (contract) => {
    await addDoc(collection(db, 'digitaliza_crm'), {
      ...contract,
      createdAt: serverTimestamp()
    })
  },

  updateContract: async (id, data) => {
    await updateDoc(doc(db, 'digitaliza_crm', id), data)
  },

  deleteContract: async (id) => {
    await deleteDoc(doc(db, 'digitaliza_crm', id))
  }
}))
