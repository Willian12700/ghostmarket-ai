const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

content = content.replace(
  "import { Wand2, Copy, Check, Code, Video, Bot, Zap, MonitorSmartphone } from 'lucide-react'",
  "import { Wand2, Copy, Check, Code, Video, Bot, Zap, MonitorSmartphone, Plus, Trash2, Tag } from 'lucide-react'"
);

fs.writeFileSync('src/pages/PromptBuilder.tsx', content);
