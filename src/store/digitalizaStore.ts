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
  type: 'nota' | 'ligacao' | 'email' | 'mudanca_status' | 'tarefa' | 'exclusao' | 'restauracao' | 'mesclagem'
  content: string
  date: string
  author?: string
}

export interface CRMChecklistItem {
  id: string
  title: string
  completed: boolean
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
  
  // NEW ENTERPRISE FEATURES
  isDeleted?: boolean
  deletedAt?: string
  score?: number // 0 a 100
  nextAction?: string
  nextActionDate?: string
  customFields?: Record<string, string | number | boolean>
  isFavorite?: boolean
  isPinned?: boolean
  checklist?: CRMChecklistItem[]
  relationships?: string[] // IDs of related leads
}

interface DigitalizaState {
  contracts: DigitalizaContract[]
  isSynced: boolean
  syncContracts: () => () => void
  addContract: (contract: Omit<DigitalizaContract, 'id'>) => Promise<void>
  updateContract: (id: string, data: Partial<Omit<DigitalizaContract, 'id'>>) => Promise<void>
  deleteContract: (id: string) => Promise<void>
  moveToTrash: (id: string) => Promise<void>
  restoreContract: (id: string) => Promise<void>
  permanentDelete: (id: string) => Promise<void>
  mergeLeads: (sourceId: string, targetId: string) => Promise<void>
}

export const useDigitalizaStore = create<DigitalizaState>()((set, get) => ({
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
      } as DigitalizaContract))
      
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
    await updateDoc(doc(db, 'digitaliza_crm', id), {
      ...data,
      updatedAt: serverTimestamp()
    })
  },

  deleteContract: async (id) => {
    // Soft delete por padrao agora? Não, deleteContract remains original.
    // We added moveToTrash for soft delete.
    await deleteDoc(doc(db, 'digitaliza_crm', id))
  },

  moveToTrash: async (id) => {
    await updateDoc(doc(db, 'digitaliza_crm', id), {
      isDeleted: true,
      deletedAt: new Date().toISOString(),
      updatedAt: serverTimestamp()
    })
  },

  restoreContract: async (id) => {
    await updateDoc(doc(db, 'digitaliza_crm', id), {
      isDeleted: false,
      deletedAt: null,
      updatedAt: serverTimestamp()
    })
  },

  permanentDelete: async (id) => {
    await deleteDoc(doc(db, 'digitaliza_crm', id))
  },

  mergeLeads: async (sourceId, targetId) => {
    const { contracts, updateContract, moveToTrash } = get()
    const source = contracts.find(c => c.id === sourceId)
    const target = contracts.find(c => c.id === targetId)

    if (!source || !target) return

    // Merge logic: Combine history, tasks, tags. Fill missing fields in target from source.
    const mergedHistory = [...(target.history || []), ...(source.history || [])].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    const mergedTasks = [...(target.tasks || []), ...(source.tasks || [])]
    const mergedTags = Array.from(new Set([...(target.tags || []), ...(source.tags || [])]))
    
    // Add a history entry about the merge
    mergedHistory.unshift({
      id: Math.random().toString(36).substring(7),
      type: 'mesclagem',
      content: `Lead ${source.client} mesclado a este.`,
      date: new Date().toISOString()
    })

    const updateData: Partial<DigitalizaContract> = {
      history: mergedHistory,
      tasks: mergedTasks,
      tags: mergedTags,
      phone: target.phone || source.phone,
      email: target.email || source.email,
      company: target.company || source.company,
      amount: Math.max(target.amount, source.amount),
      customFields: { ...(source.customFields || {}), ...(target.customFields || {}) }
    }

    await updateContract(targetId, updateData)
    await moveToTrash(sourceId)
  }
}))
