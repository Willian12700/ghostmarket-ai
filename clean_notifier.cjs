const fs = require('fs');
let content = fs.readFileSync('src/components/ui/SalesNotifier.tsx', 'utf8');

content = content.replace("const isInitialLoad = useRef(true)", "");

fs.writeFileSync('src/components/ui/SalesNotifier.tsx', content);
