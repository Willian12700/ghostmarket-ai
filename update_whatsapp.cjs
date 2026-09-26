const fs = require('fs');

const newNumber = '5584996162332';
const placeholder = '5511999999999';

try {
  let landingCode = fs.readFileSync('src/pages/Landing.tsx', 'utf8');
  landingCode = landingCode.replace(new RegExp(placeholder, 'g'), newNumber);
  fs.writeFileSync('src/pages/Landing.tsx', landingCode, 'utf8');
  
  let demoCode = fs.readFileSync('src/pages/Demo.tsx', 'utf8');
  demoCode = demoCode.replace(new RegExp(placeholder, 'g'), newNumber);
  fs.writeFileSync('src/pages/Demo.tsx', demoCode, 'utf8');
  
  console.log('Numbers updated successfully.');
} catch (e) {
  console.error(e);
}
