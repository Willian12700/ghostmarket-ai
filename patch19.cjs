const fs = require('fs');
let c = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');
c = c.replace('import { useState, useEffect, useRef }', 'import { useState, useRef }');
c = c.replace('Eye, Download, Code', 'Eye, Code');
c = c.replace('variant="outline"', 'variant="secondary"');
fs.writeFileSync('src/pages/SiteBuilder.tsx', c);
