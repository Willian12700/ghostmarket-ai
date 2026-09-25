const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

content = content.replace(
    /import \{([^{}]+)\} from 'lucide-react'/g,
    (match, imports) => {
        if (!imports.includes('Wallet')) {
            return `import { \${imports}, Wallet } from 'lucide-react'`;
        }
        return match;
    }
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
