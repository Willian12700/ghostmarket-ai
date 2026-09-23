const fs = require('fs');
let content = fs.readFileSync('src/pages/Finance.tsx', 'utf8');

// 1. imports
content = content.replace(
  "import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, ExternalLink, Download, Building, ArrowRight, TrendingUp } from 'lucide-react'",
  "import { Wallet, ArrowUpRight, ArrowDownRight, Clock, CheckCircle, Download, Building, ArrowRight, TrendingUp, RefreshCcw } from 'lucide-react'"
);

// 2. remove unused activeTab
content = content.replace(
  "const [activeTab, setActiveTab] = useState<'overview' | 'withdrawals'>('overview')",
  ""
);

// 3. Fix tooltip formatter
content = content.replace(
  "formatter={(value: number) => [formatCurrency(value), 'Receita']}",
  "formatter={(value: any) => [formatCurrency(value), 'Receita']}"
);

fs.writeFileSync('src/pages/Finance.tsx', content, 'utf8');
