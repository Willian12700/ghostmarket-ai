const fs = require('fs');
let file = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

const protectCode = `
    let protectInjection = '';
    if (isProtectionEnabled) {
      protectInjection = \`
<style>
/* Proteção Anti-Cópia GhostMarket */
body { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
</style>
<script>
// Proteção Anti-Cópia GhostMarket
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('keydown', e => {
  if (e.ctrlKey && (e.key === 'c' || e.key === 'u' || e.key === 's' || e.key === 'p' || e.key === 'C' || e.key === 'U' || e.key === 'S' || e.key === 'P')) e.preventDefault();
  if (e.ctrlKey && e.shiftKey && (e.key === 'i' || e.key === 'j' || e.key === 'c' || e.key === 'I' || e.key === 'J' || e.key === 'C')) e.preventDefault();
  if (e.key === 'F12') e.preventDefault();
});
</script>\`;
    }`;

file = file.replace(/let finalHtml = htmlContent \|\| ''/, "let finalHtml = htmlContent || ''\n" + protectCode);

fs.writeFileSync('src/pages/SiteBuilder.tsx', file, 'utf8');
console.log('Fixed protectInjection');
