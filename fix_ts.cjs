const fs = require('fs');
let content = fs.readFileSync('src/pages/HostedSites.tsx', 'utf8');

// 1. Fix Site interface
content = content.replace(
  'autoHealed?: boolean',
  'autoHealed?: boolean\n  isActive?: boolean'
);

// 2. Fix Power import. (Maybe I replaced the wrong string for import)
if (!content.includes(' Power,')) {
    content = content.replace(
        "import { Globe, Plus, Link2, Search, TrendingUp, Eye, Trash2, BarChart3, Wand2, ShieldCheck, CheckCircle, X } from 'lucide-react'",
        "import { Globe, Plus, Link2, Search, TrendingUp, Eye, Trash2, BarChart3, Wand2, ShieldCheck, CheckCircle, X, Power } from 'lucide-react'"
    );
}

fs.writeFileSync('src/pages/HostedSites.tsx', content, 'utf8');
