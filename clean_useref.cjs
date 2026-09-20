const fs = require('fs');
let content = fs.readFileSync('src/components/ui/SalesNotifier.tsx', 'utf8');

content = content.replace("import { useEffect, useState, useRef } from 'react'", "import { useEffect, useState } from 'react'");

fs.writeFileSync('src/components/ui/SalesNotifier.tsx', content);
