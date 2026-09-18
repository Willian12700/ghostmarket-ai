import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SalesData {
  day: string
  revenue: number
}

export interface LeaderboardUser {
  id: string
  position: number
  name: string
  projects: number
  sales: number
  revenue: number
}

interface DashboardState {
  totalRevenue: number
  activeProjects: number
  capturedLeads: number
  salesData: SalesData[]
  leaderboard: LeaderboardUser[]
  simulateSale: (amount: number) => void
}

const initialSalesData = [
  { day: 'Seg', revenue: 1200 },
  { day: 'Ter', revenue: 2400 },
  { day: 'Qua', revenue: 1850 },
  { day: 'Qui', revenue: 3200 },
  { day: 'Sex', revenue: 2750 },
  { day: 'Sáb', revenue: 4100 },
  { day: 'Dom', revenue: 3900 },
]

const initialLeaderboard = [
  { id: '1', position: 1, name: 'Você', projects: 8, sales: 145, revenue: 12480 },
  { id: '2', position: 2, name: 'Lucas S.', projects: 5, sales: 120, revenue: 9800 },
  { id: '3', position: 3, name: 'Mariana C.', projects: 6, sales: 95, revenue: 8450 },
  { id: '4', position: 4, name: 'Roberto A.', projects: 3, sales: 60, revenue: 5200 },
  { id: '5', position: 5, name: 'Ana T.', projects: 2, sales: 45, revenue: 3800 },
]

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      totalRevenue: 12480,
      activeProjects: 8,
      capturedLeads: 347,
      salesData: initialSalesData,
      leaderboard: initialLeaderboard,
      simulateSale: (amount) => set((state) => {
        const newTotal = state.totalRevenue + amount
        
        // Update the last day's revenue in the chart
        const newSalesData = [...state.salesData]
        newSalesData[newSalesData.length - 1] = {
          ...newSalesData[newSalesData.length - 1],
          revenue: newSalesData[newSalesData.length - 1].revenue + amount
        }

        // Update the user's position in leaderboard (id '1' is 'Você')
        let newLeaderboard = state.leaderboard.map(user => {
          if (user.id === '1') {
            return {
              ...user,
              sales: user.sales + 1,
              revenue: user.revenue + amount
            }
          }
          return user
        })

        // Sort leaderboard by revenue
        newLeaderboard.sort((a, b) => b.revenue - a.revenue)
        
        // Update positions
        newLeaderboard = newLeaderboard.map((user, index) => ({
          ...user,
          position: index + 1
        }))

        return {
          totalRevenue: newTotal,
          salesData: newSalesData,
          leaderboard: newLeaderboard
        }
      })
    }),
    {
      name: 'ghostmarket-dashboard',
    }
  )
)
