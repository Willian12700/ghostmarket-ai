const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const startIdx = content.indexOf('const calculateMetrics = () => {');
const endIdx = content.indexOf('let hoje = 0, semana = 0, mes = 0, ano = 0');

if (startIdx !== -1 && endIdx !== -1) {
  const newLogic = `const calculateMetrics = () => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    
    // Últimos 7 dias (Acumulado)
    const startOfWeekTime = startOfToday - (6 * 24 * 60 * 60 * 1000);
    
    // Últimos 30 dias (Performance Mensal)
    const startOfMonthTime = startOfToday - (29 * 24 * 60 * 60 * 1000);
    
    // Este ano
    const startOfYearTime = new Date(now.getFullYear(), 0, 1).getTime()

    `;
  content = content.substring(0, startIdx) + newLogic + content.substring(endIdx);
  
  // also need to replace the variables inside the forEach
  content = content.replace("tx.date >= startOfWeek.getTime()", "tx.date >= startOfWeekTime");
  content = content.replace("tx.date >= startOfMonth", "tx.date >= startOfMonthTime");
  content = content.replace("tx.date >= startOfYear", "tx.date >= startOfYearTime");

  fs.writeFileSync('src/pages/Dashboard.tsx', content);
  console.log("Patched calculateMetrics!");
} else {
  console.log("Not found boundaries!");
}
