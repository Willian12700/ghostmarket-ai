const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// I will just find the start and end and replace backticks with single quotes
const startIdx = content.indexOf('## 3. DESIGN E UI/UX');
const endIdx = content.indexOf('## 4. FUNCIONALIDADES');

if (startIdx !== -1 && endIdx !== -1) {
    let block = content.substring(startIdx, endIdx);
    // Replace backticks with single quotes inside this block only
    block = block.replace(/\`/g, "'");
    content = content.substring(0, startIdx) + block + content.substring(endIdx);
    fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
    console.log('Fixed backticks');
}
