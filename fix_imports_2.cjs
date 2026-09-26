const fs = require('fs');
let code = fs.readFileSync('src/pages/SalesScripts.tsx', 'utf8');
code = code.replace("import { useState } from 'react'", "");
code = code.replace("Copy, CheckCircle2, Zap", "Copy, Zap");
fs.writeFileSync('src/pages/SalesScripts.tsx', code, 'utf8');
