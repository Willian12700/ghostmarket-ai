const fs = require('fs');

let builder = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

builder = builder.replace(
  `import { Plus, GripVertical, Settings2, Trash2, Monitor, Smartphone, Globe, Play, CheckCircle2, Rocket, Server, LayoutTemplate, Image as ImageIcon, Link as LinkIcon, Wand2 } from 'lucide-react'`,
  `import { Plus, GripVertical, Settings2, Trash2, Monitor, Smartphone, Globe, Play, CheckCircle2, Rocket, Image as ImageIcon, Link as LinkIcon, Wand2, Eye } from 'lucide-react'`
);

builder = builder.replace(`variant="outline"`, `variant="ghost"`);

fs.writeFileSync('src/pages/SiteBuilder.tsx', builder, 'utf8');

let viewer = fs.readFileSync('src/pages/SiteViewer.tsx', 'utf8');
viewer = viewer.replace(`import { CheckCircle2, Rocket } from 'lucide-react'`, `import { CheckCircle2 } from 'lucide-react'`);
fs.writeFileSync('src/pages/SiteViewer.tsx', viewer, 'utf8');
