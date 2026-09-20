const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const target = `  const calculateMetrics = () => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    
    const startOfWeek = new Date(startOfToday)
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime()
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime()`;

const newLogic = `  const calculateMetrics = () => {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    
    // Últimos 7 dias (Acumulado)
    const startOfWeek = startOfToday - (6 * 24 * 60 * 60 * 1000);
    
    // Últimos 30 dias (Performance Mensal)
    const startOfMonth = startOfToday - (29 * 24 * 60 * 60 * 1000);
    
    // Este ano
    const startOfYear = new Date(now.getFullYear(), 0, 1).getTime()`;

if (content.includes("startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())")) {
  content = content.replace(target, newLogic);
  fs.writeFileSync('src/pages/Dashboard.tsx', content);
  console.log("Patched calculateMetrics!");
} else {
  console.log("Target not found.");
}
