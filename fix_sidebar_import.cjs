const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');
content = content.replace("} , Key } from 'lucide-react'", ", Key } from 'lucide-react'");
fs.writeFileSync('src/components/layout/Sidebar.tsx', content, 'utf8');
