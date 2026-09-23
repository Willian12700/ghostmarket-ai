const fs = require('fs');
let content = fs.readFileSync('src/pages/Finance.tsx', 'utf8');

content = content.replace("import { useState } from 'react'\n", "");

fs.writeFileSync('src/pages/Finance.tsx', content, 'utf8');
