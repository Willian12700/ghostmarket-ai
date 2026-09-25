const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/<Route path="\/products".*?\/>/g, '');
content = content.replace(/<Route path="\/finance".*?\/>/g, '');
content = content.replace(/<Route path="\/pay\/:productId".*?\/>/g, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
