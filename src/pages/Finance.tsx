import { useState } from 'react'
import { motion } from 'framer-motion'
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Download, Building, ArrowRight, TrendingUp, RefreshCcw, Link2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const revenueData: any[] = []
const recentTransactions: any[] = []

export const Finance = () => {
  // Para o MVP: Simulando se o usuário já vinculou o Mercado Pago
  const [isMpConnected, setIsMpConnected] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-6">
      
      {/* HEADER SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
      >
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Financeiro</h1>
          <p className="text-textSecondary">Acompanhe suas vendas processadas pelo gateway GhostMarket.</p>
        </div>
        
        {isMpConnected && (
          <div className="flex gap-3">
            <Button variant="secondary" className="border-border text-white bg-panel hover:bg-background">
              <Download className="w-4 h-4 mr-2" /> Exportar Relatório
            </Button>
            <Button onClick={() => window.open('https://www.mercadopago.com.br/', '_blank')} className="bg-[#009EE3] hover:bg-[#009EE3]/90 text-white shadow-[0_0_20px_rgba(0,158,227,0.3)] font-bold">
              <Building className="w-4 h-4 mr-2" /> Sacar no Mercado Pago
            </Button>
          </div>
        )}
      </motion.div>

      {!isMpConnected ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-panel border border-border rounded-3xl p-10 md:p-16 flex flex-col items-center text-center mt-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#009EE3]/10 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -ml-40 -mb-40 pointer-events-none" />
          
          <div className="w-24 h-24 bg-background border border-border rounded-3xl flex items-center justify-center mb-8 relative z-10 shadow-2xl">
            <div className="w-12 h-12 bg-[#009EE3]/20 rounded-xl flex items-center justify-center">
              <Link2 className="w-6 h-6 text-[#009EE3]" />
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-4 relative z-10">Conecte sua conta Mercado Pago</h2>
          <p className="text-textSecondary text-lg max-w-2xl mx-auto mb-10 relative z-10">
            Para começar a vender e gerar links de checkout nativos, você precisa vincular sua conta do Mercado Pago. 
            O dinheiro das suas vendas cai direto na sua conta, sem retenções.
          </p>
          
          <Button 
            onClick={() => setIsMpConnected(true)} 
            className="h-14 px-8 text-lg bg-[#009EE3] hover:bg-[#009EE3]/90 text-white font-bold rounded-2xl shadow-[0_0_30px_rgba(0,158,227,0.3)] relative z-10 transition-all hover:scale-105"
          >
            Vincular Mercado Pago Agora
          </Button>
          
          <div className="flex items-center gap-6 mt-10 relative z-10 opacity-60 grayscale">
            <span className="font-bold text-white text-sm">Integração Oficial Segura</span>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: BALANCE CARDS */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* MAIN BALANCE CARD */}
            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#009EE3]/10 to-background border border-[#009EE3]/20 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#009EE3]/20 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="p-3 bg-[#009EE3]/10 rounded-xl border border-[#009EE3]/20">
                  <Wallet className="w-6 h-6 text-[#009EE3]" />
                </div>
                <h3 className="text-sm font-bold text-[#009EE3] uppercase tracking-widest">Saldo Recebido</h3>
              </div>
              
              <div className="relative z-10 mb-2">
                <span className="text-sm text-[#009EE3] mr-1 font-bold">R$</span>
                <span className="text-5xl font-black text-white tracking-tighter">0,00</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm mt-6 relative z-10 p-3 bg-panel border border-border rounded-xl">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-textSecondary font-medium">Disponível no seu app Mercado Pago</span>
              </div>
            </motion.div>

            {/* SECONDARY BALANCE CARDS */}
            <div className="grid grid-cols-2 gap-4">
              <motion.div variants={itemVariants} className="bg-panel border border-border rounded-2xl p-5 relative overflow-hidden">
                <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2">A Receber</h3>
                <div className="text-2xl font-black text-white">{formatCurrency(0)}</div>
                <p className="text-xs text-textSecondary flex items-center mt-2 font-medium">
                  <Clock className="w-3 h-3 mr-1" /> Processando...
                </p>
              </motion.div>
              
              <motion.div variants={itemVariants} className="bg-panel border border-border rounded-2xl p-5 relative overflow-hidden">
                <h3 className="text-xs font-bold text-textSecondary uppercase tracking-widest mb-2">Vendas Hoje</h3>
                <div className="text-2xl font-black text-white">0</div>
                <p className="text-xs text-textSecondary flex items-center mt-2 font-medium">
                  <TrendingUp className="w-3 h-3 mr-1" /> 0% conversão
                </p>
              </motion.div>
            </div>
          </div>

          {/* RIGHT COLUMN: CHART & TRANSACTIONS */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {/* CHART BLOCK */}
            <motion.div variants={itemVariants} className="bg-panel border border-border rounded-3xl p-6 lg:p-8 flex flex-col min-h-[300px] relative overflow-hidden">
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-xl font-extrabold text-white tracking-tight">Receita Líquida</h3>
                  <p className="text-sm text-textSecondary font-medium mt-1">Ganhos já com as taxas da plataforma descontadas.</p>
                </div>
                <div className="flex items-center p-1 bg-background border border-border rounded-lg">
                  <button className="px-3 py-1 rounded-md text-xs font-bold bg-[#009EE3] text-white shadow-md">30 Dias</button>
                  <button className="px-3 py-1 rounded-md text-xs font-bold text-textSecondary hover:text-white transition-colors">6 Meses</button>
                </div>
              </div>
              
              <div className="flex-1 w-full h-[250px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  {revenueData.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-textSecondary">
                      <TrendingUp className="w-10 h-10 mb-3 opacity-20" />
                      <p>Sem dados de receita no período.</p>
                    </div>
                  ) : (
                    <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorFinance" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#009EE3" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#009EE3" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                      <YAxis stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: any) => `R$ ${value}`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                        itemStyle={{ color: '#009EE3' }}
                        formatter={(value: any) => [formatCurrency(value), 'Receita']}
                      />
                      <Area type="monotone" dataKey="amount" stroke="#009EE3" strokeWidth={3} fillOpacity={1} fill="url(#colorFinance)" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* TRANSACTIONS BLOCK */}
            <motion.div variants={itemVariants} className="bg-panel border border-border rounded-3xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-border flex justify-between items-center bg-background/50">
                <h3 className="text-lg font-extrabold text-white tracking-tight">Movimentações Recentes</h3>
                <button className="text-sm font-bold text-[#009EE3] hover:text-[#009EE3]/80 flex items-center gap-1 transition-colors">
                  Ver extrato completo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-background border-b border-border text-xs font-bold text-textSecondary uppercase tracking-widest">
                      <th className="p-4 pl-6 font-medium">Transação</th>
                      <th className="p-4 font-medium">Cliente/Origem</th>
                      <th className="p-4 font-medium">Data</th>
                      <th className="p-4 font-medium text-right">Valor</th>
                      <th className="p-4 pr-6 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {recentTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-textSecondary">
                          <div className="flex flex-col items-center justify-center">
                            <Wallet className="w-10 h-10 mb-3 opacity-20" />
                            <p>Nenhuma movimentação encontrada.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      recentTransactions.map((tx, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.amount < 0 ? 'bg-danger/10 text-danger' : 'bg-[#009EE3]/10 text-[#009EE3]'}`}>
                                {tx.amount < 0 ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">{tx.type}</p>
                                <p className="text-xs text-textSecondary">{tx.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="text-sm font-bold text-white">{tx.customer}</p>
                          </td>
                          <td className="p-4 text-sm text-textSecondary font-medium">
                            {tx.date}
                          </td>
                          <td className="p-4 text-right">
                            <span className={`text-sm font-bold ${tx.amount < 0 ? 'text-white' : 'text-success'}`}>
                              {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-right">
                            {tx.status === 'approved' && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-success/10 border border-success/20 text-success text-xs font-bold">
                                <CheckCircle className="w-3 h-3" /> Aprovado
                              </div>
                            )}
                            {tx.status === 'processing' && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-warning/10 border border-warning/20 text-warning text-xs font-bold">
                                <Clock className="w-3 h-3" /> Em Processamento
                              </div>
                            )}
                            {tx.status === 'refunded' && (
                              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-danger/10 border border-danger/20 text-danger text-xs font-bold">
                                <RefreshCcw className="w-3 h-3" /> Reembolsado
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
