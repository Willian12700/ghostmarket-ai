const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// remove unused imports
content = content.replace("Plus, Trash2, Tag, ", "");
content = content.replace("import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'", "");
content = content.replace("import { motion, AnimatePresence } from 'framer-motion'", "");

// comment out or remove unused functions
content = content.replace("const addProduct", "// const addProduct");
content = content.replace("const updateProduct", "// const updateProduct");
content = content.replace("const removeProduct", "// const removeProduct");

fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
