import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SalesData {
  day: string
  revenue: number
}

export interface Transaction {
  id: string
  clientName: string
  amount: number
  status: 'Aprovado' | 'Pendente' | 'Cancelado'
  date: string
}

interface DashboardState {
  totalRevenue: number
  activeProjects: number
  capturedLeads: number
  salesData: SalesData[]
  recentTransactions: Transaction[]
}

const initialSalesData = [
  { day: 'Seg', revenue: 0 },
  { day: 'Ter', revenue: 0 },
  { day: 'Qua', revenue: 0 },
  { day: 'Qui', revenue: 0 },
  { day: 'Sex', revenue: 0 },
  { day: 'Sáb', revenue: 0 },
  { day: 'Dom', revenue: 0 },
]

export const useDashboardStore = create<DashboardState>()(
  persist(
    () => ({
      totalRevenue: 0,
      activeProjects: 0,
      capturedLeads: 0,
      salesData: initialSalesData,
      recentTransactions: [] as Transaction[],
    }),
    {
      name: 'ghostmarket-dashboard',
      version: 1, // Invalidate old cache
    }
  )
)
