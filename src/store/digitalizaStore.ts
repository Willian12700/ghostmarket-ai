import { create } from 'zustand'
import { db } from '@/config/firebase'
import { collection, query, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, orderBy, where, getDocs, limit, runTransaction } from 'firebase/firestore'

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

export interface CRMWorkspace {
  id: string
  name: string
  company: string
  inviteCode: string
  ownerId: string
  createdAt: string
}

export interface CRMWorkspaceMember {
  id: string
  userId: string
  userEmail: string
  userName: string
  workspaceId: string
  role: 'owner' | 'admin' | 'member'
  joinedAt: string
}

export interface DigitalizaContract {
  id: string
  workspaceId: string // NEW
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
  workspaces: CRMWorkspace[]
  activeWorkspace: CRMWorkspace | null
  contracts: DigitalizaContract[]
  isSynced: boolean
  
  fetchWorkspaces: (userId: string) => () => void
  setActiveWorkspace: (workspace: CRMWorkspace | null) => void
  createWorkspace: (userId: string, userEmail: string, userName: string, data: { name: string, company: string }) => Promise<void>
  joinWorkspace: (userId: string, userEmail: string, userName: string, code: string) => Promise<boolean>
  
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
  workspaces: [],
  activeWorkspace: null,
  contracts: [],
  isSynced: false,

  fetchWorkspaces: (userId: string) => {
    // Escutar mudanças nos membros onde userId == userId
    const qMembers = query(
      collection(db, 'crm_workspace_members'),
      where('userId', '==', userId)
    )

    const unsubscribe = onSnapshot(qMembers, async (snapshot) => {
      const memberDocs = snapshot.docs.map(doc => doc.data() as CRMWorkspaceMember)
      
      if (memberDocs.length === 0) {
        set({ workspaces: [], activeWorkspace: null })
        return
      }

      // Buscar os workspaces
      const workspaceIds = memberDocs.map(m => m.workspaceId)
      // Como o firestore "in" suporta ate 10 ids, caso haja mais, precisaria quebrar. Assumimos < 10 por enquanto.
      
      // Para evitar limite de 10 do 'in', fazemos query separada para cada se preferir, 
      // ou onSnapshot nos workspaces.
      // Vou simplificar pegando todos de uma vez se <= 10.
      const chunks = []
      for (let i = 0; i < workspaceIds.length; i += 10) {
        chunks.push(workspaceIds.slice(i, i + 10))
      }

      let allWorkspaces: CRMWorkspace[] = []
      for (const chunk of chunks) {
        const qWs = query(collection(db, 'crm_workspaces'), where('id', 'in', chunk))
        const wsSnapshot = await getDocs(qWs)
        wsSnapshot.forEach(doc => {
          allWorkspaces.push({ id: doc.id, ...doc.data() } as CRMWorkspace)
        })
      }

      set((state) => {
        // Se nao tem ativo, seleciona o primeiro
        const active = state.activeWorkspace && allWorkspaces.find(w => w.id === state.activeWorkspace?.id) 
          ? state.activeWorkspace 
          : allWorkspaces[0] || null

        return { workspaces: allWorkspaces, activeWorkspace: active }
      })
    })

    return unsubscribe
  },

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace, isSynced: false, contracts: [] })
  },

  createWorkspace: async (userId, userEmail, userName, data) => {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    // Create Workspace
    const wsRef = doc(collection(db, 'crm_workspaces'))
    const newWs: CRMWorkspace = {
      id: wsRef.id,
      name: data.name,
      company: data.company,
      inviteCode,
      ownerId: userId,
      createdAt: new Date().toISOString()
    }
    
    // Create Member
    const memberRef = doc(collection(db, 'crm_workspace_members'))
    const newMember: CRMWorkspaceMember = {
      id: memberRef.id,
      userId,
      userEmail,
      userName,
      workspaceId: wsRef.id,
      role: 'owner',
      joinedAt: new Date().toISOString()
    }

    await runTransaction(db, async (transaction) => {
      transaction.set(wsRef, newWs)
      transaction.set(memberRef, newMember)
    })
  },

  joinWorkspace: async (userId, userEmail, userName, code) => {
    // Buscar workspace pelo codigo
    const qWs = query(collection(db, 'crm_workspaces'), where('inviteCode', '==', code), limit(1))
    const wsSnapshot = await getDocs(qWs)
    
    if (wsSnapshot.empty) return false
    const wsData = wsSnapshot.docs[0].data() as CRMWorkspace

    // Checar se já é membro
    const qMember = query(
      collection(db, 'crm_workspace_members'), 
      where('workspaceId', '==', wsData.id), 
      where('userId', '==', userId), 
      limit(1)
    )
    const memberSnapshot = await getDocs(qMember)
    if (!memberSnapshot.empty) return true // Já está lá

    // Adicionar membro
    const newMemberRef = doc(collection(db, 'crm_workspace_members'))
    await addDoc(collection(db, 'crm_workspace_members'), {
      id: newMemberRef.id,
      userId,
      userEmail,
      userName,
      workspaceId: wsData.id,
      role: 'member',
      joinedAt: new Date().toISOString()
    })

    return true
  },

  syncContracts: () => {
    const { activeWorkspace } = get()
    if (!activeWorkspace) {
      set({ contracts: [], isSynced: true })
      return () => {}
    }

    const q = query(
      collection(db, 'digitaliza_crm'),
      where('workspaceId', '==', activeWorkspace.id),
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
