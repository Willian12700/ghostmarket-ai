const fs = require('fs');
let content = fs.readFileSync('src/pages/ClientReport.tsx', 'utf8');

const printStyles = `
  <style>
    @media print {
      body { background: white !important; color: black !important; }
      .bg-\\[\\#0f0c29\\] { background: white !important; }
      .text-white { color: black !important; }
      .text-gray-400 { color: #666 !important; }
      .border-white\\/10 { border-color: #ddd !important; }
      button, .hide-on-print { display: none !important; }
      header { border-bottom: 2px solid #eee !important; padding-bottom: 20px !important; }
    }
  </style>
`;

if (!content.includes('@media print')) {
  content = content.replace(
    `const item = {`,
    `${printStyles}\n  const item = {`
  );
  fs.writeFileSync('src/pages/ClientReport.tsx', content, 'utf8');
}
