const fs = require('fs');
let content = fs.readFileSync('src/pages/Finance.tsx', 'utf8');

// 1. Remove mock data arrays
content = content.replace(/const revenueData = \[[\s\S]*?\]\s*const recentTransactions = \[[\s\S]*?\]/, `const revenueData: any[] = []
const recentTransactions: any[] = []`);

// 2. Replace hardcoded balances with 0
content = content.replace('<span className="text-5xl font-black text-white tracking-tighter">12.450,00</span>', '<span className="text-5xl font-black text-white tracking-tighter">0,00</span>');
content = content.replace('{formatCurrency(4800.50)}', '{formatCurrency(0)}');
content = content.replace('{formatCurrency(45900.00)}', '{formatCurrency(0)}');

// 3. Handle Empty State for Transactions
const txTableStart = `<tbody className="divide-y divide-border/50">`;
const txTableEnd = `</tbody>`;

const txTableReplacement = `<tbody className="divide-y divide-border/50">
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
                            <div className={\`w-10 h-10 rounded-full flex items-center justify-center \${tx.amount < 0 ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'}\`}>
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
                          <span className={\`text-sm font-bold \${tx.amount < 0 ? 'text-white' : 'text-success'}\`}>
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
                </tbody>`;

const txTableMatch = content.match(/<tbody className="divide-y divide-border\/50">[\s\S]*?<\/tbody>/);
if (txTableMatch) {
  content = content.replace(txTableMatch[0], txTableReplacement);
}

// 4. Handle Empty State for Chart
const chartStart = `<AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>`;
const chartEnd = `</AreaChart>`;
const chartReplacement = `{revenueData.length === 0 ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-textSecondary">
                  <TrendingUp className="w-10 h-10 mb-3 opacity-20" />
                  <p>Sem dados de receita no período.</p>
                </div>
              ) : (
                <AreaChart data={revenueData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFinance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="#52525B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value: any) => \`R$ \${value}\`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181B', borderColor: '#27272A', borderRadius: '12px', color: '#fff', fontWeight: 'bold' }}
                    itemStyle={{ color: '#A78BFA' }}
                    formatter={(value: any) => [formatCurrency(value), 'Receita']}
                  />
                  <Area type="monotone" dataKey="amount" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorFinance)" />
                </AreaChart>
              )}`;

const chartMatch = content.match(/<AreaChart data=\{revenueData\}[\s\S]*?<\/AreaChart>/);
if (chartMatch) {
  content = content.replace(chartMatch[0], chartReplacement);
}

fs.writeFileSync('src/pages/Finance.tsx', content, 'utf8');
