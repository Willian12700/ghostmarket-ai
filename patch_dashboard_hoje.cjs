const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// 1. Update useState
content = content.replace(
  "const [dateFilter, setDateFilter] = useState<'semana' | 'mes' | 'ano'>('semana')",
  "const [dateFilter, setDateFilter] = useState<'hoje' | 'semana' | 'mes' | 'ano'>('semana')"
);

// 2. Update daysToSubtract
content = content.replace(
  "let daysToSubtract = dateFilter === 'semana' ? 7 : dateFilter === 'mes' ? 30 : 365",
  "let daysToSubtract = dateFilter === 'hoje' ? 1 : dateFilter === 'semana' ? 7 : dateFilter === 'mes' ? 30 : 365"
);

// 3. Add Hoje button
const buttonsTarget = `              <div className="flex items-center p-1 bg-background border border-border rounded-lg mt-4 sm:mt-0">
                <button 
                  onClick={() => setDateFilter('semana')}
                  className={\`px-4 py-1.5 rounded-md text-xs font-bold transition-all \${dateFilter === 'semana' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-white'}\`}
                >
                  7 Dias
                </button>`;

const newButtons = `              <div className="flex items-center p-1 bg-background border border-border rounded-lg mt-4 sm:mt-0 overflow-x-auto">
                <button 
                  onClick={() => setDateFilter('hoje')}
                  className={\`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap \${dateFilter === 'hoje' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-white'}\`}
                >
                  Hoje
                </button>
                <button 
                  onClick={() => setDateFilter('semana')}
                  className={\`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap \${dateFilter === 'semana' ? 'bg-primary text-white shadow-md' : 'text-textSecondary hover:text-white'}\`}
                >
                  7 Dias
                </button>`;

if (content.includes("setDateFilter('semana')")) {
  content = content.replace(buttonsTarget, newButtons);
  // Make sure other buttons also have whitespace-nowrap to avoid breaking on small screens
  content = content.replace(
    "className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${dateFilter === 'mes'",
    "className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${dateFilter === 'mes'"
  );
  content = content.replace(
    "className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${dateFilter === 'ano'",
    "className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${dateFilter === 'ano'"
  );
  fs.writeFileSync('src/pages/Dashboard.tsx', content);
  console.log("Patched!");
} else {
  console.log("Could not find button logic");
}
