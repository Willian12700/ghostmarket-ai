const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Insert state
const stateToInsert = `
  const [monthlyGoal, setMonthlyGoal] = useState<number>(() => {
    const saved = localStorage.getItem('ghost_monthly_goal')
    return saved ? Number(saved) : 50000
  })
`;
content = content.replace('const { hoje, semana, mes, ano } = calculateMetrics()', stateToInsert + '\n  const { hoje, semana, mes, ano } = calculateMetrics()');

// 2. Insert Goal UI
const goalUI = `
      {/* GHOST GOAL AUTO-TRACKING */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.2 }}
        className="bg-panel border border-primary/30 rounded-2xl p-6 relative overflow-hidden mb-8"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-extrabold text-white tracking-tight">Auto-Cálculo de Meta</h3>
            </div>
            <p className="text-sm text-textSecondary flex items-center gap-2">
              Meta Mensal: 
              <input 
                type="number" 
                className="bg-background border border-border rounded-lg px-3 py-1.5 text-white w-36 focus:outline-none focus:border-primary transition-colors"
                value={monthlyGoal}
                onChange={(e) => {
                  setMonthlyGoal(Number(e.target.value))
                  localStorage.setItem('ghost_monthly_goal', e.target.value)
                }}
              />
            </p>
          </div>
          <div className="flex-1 w-full max-w-xl">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-white">Progresso ({Math.min(100, (mes / (monthlyGoal || 1)) * 100).toFixed(1)}%)</span>
              <span className="text-primary">{formatCurrency(mes)} / {formatCurrency(monthlyGoal)}</span>
            </div>
            <div className="w-full bg-background rounded-full h-3 border border-border overflow-hidden">
              <div 
                className="bg-primary h-full rounded-full transition-all duration-1000 relative"
                style={{ width: \`\${Math.min(100, (mes / (monthlyGoal || 1)) * 100)}%\` }}
              >
                <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row gap-4 items-center justify-between relative z-10">
          <div className="text-sm text-textSecondary">
            {mes >= monthlyGoal ? (
              <span className="text-success font-bold flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Parabéns! Você ultrapassou sua meta em {formatCurrency(mes - monthlyGoal)}!
              </span>
            ) : (
              <span>
                Faltam <span className="text-white font-bold">{formatCurrency(monthlyGoal - mes)}</span> para atingir a meta.
              </span>
            )}
          </div>
          {mes < monthlyGoal && (
            <div className="bg-primary/10 border border-primary/30 text-primary px-4 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-pulse shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <Activity className="w-4 h-4" /> Sugestão da IA: Aumente o orçamento da oferta principal em 20% hoje.
            </div>
          )}
        </div>
      </motion.div>

      {/* BOTTOM SECTION */}`;

content = content.replace('{/* BOTTOM SECTION */}', goalUI);

fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
