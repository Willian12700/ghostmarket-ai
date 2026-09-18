import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Contract {
  id: string
  client: string
  amount: number
  date: string
  status: 'Ativo' | 'Finalizado'
}

interface ContractState {
  contracts: Contract[]
  addContract: (contract: Omit<Contract, 'id'>) => void
  updateContract: (id: string, data: Partial<Omit<Contract, 'id'>>) => void
  deleteContract: (id: string) => void
}

export const useContractStore = create<ContractState>()(
  persist(
    (set) => ({
      contracts: [],
      addContract: (contract) => set((state) => ({
        contracts: [
          { ...contract, id: Math.random().toString(36).substring(2, 9) },
          ...state.contracts
        ]
      })),
      updateContract: (id, data) => set((state) => ({
        contracts: state.contracts.map(c => c.id === id ? { ...c, ...data } : c)
      })),
      deleteContract: (id) => set((state) => ({
        contracts: state.contracts.filter(c => c.id !== id)
      }))
    }),
    {
      name: 'ghostmarket-contracts-v2',
    }
  )
)
