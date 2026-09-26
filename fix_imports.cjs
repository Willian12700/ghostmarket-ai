const fs = require('fs');
let code = fs.readFileSync('src/components/ui/AppPreview.tsx', 'utf8');

const newImports = `import { motion } from 'framer-motion'
import { 
  Ghost, Bell, Plus, Zap, LayoutDashboard, Crown, Sparkles, 
  Settings, LogOut, DollarSign, 
  Calendar, TrendingUp, User, ArrowUpRight, MessageSquare,
  Globe, Code, Search, Bot
} from 'lucide-react'`;

// Replace everything up to export const AppPreview
code = code.replace(/^[\s\S]*?export const AppPreview/m, newImports + '\n\nexport const AppPreview');

fs.writeFileSync('src/components/ui/AppPreview.tsx', code, 'utf8');
