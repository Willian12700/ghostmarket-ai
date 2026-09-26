const fs = require('fs');

const files = ['src/pages/Affiliates.tsx', 'src/pages/PublicPartners.tsx'];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // If in Affiliates.tsx I swapped them earlier:
  // "GhostMarket Mensal" has R$ 64,99 and "Plano Vitalício"
  // Let me just replace the specific strings.
  
  // Replace 64,99 with 45,15
  content = content.replace(/R\$ 64,99/g, 'R$ 45,15');
  
  // Replace (50%) with (35%) ONLY in the Vitalício part.
  // Actually, replacing all "50%" near Vitalício is easier.
  // Let's replace "Plano Mensal (50% de comissão)" -> well that's in Vitalício box but wrong text!
  
  // Let's just fix the exact lines!
  if (file === 'src/pages/Affiliates.tsx') {
    content = content.replace('R$ 64,99\n            </div>\n            <p className="text-sm text-textSecondary mt-2">Sua comissão (50%) a cada venda do Plano Vitalício.</p>', 'R$ 64,99\n            </div>\n            <p className="text-sm text-textSecondary mt-2">Sua comissão (50%) a cada venda do Plano Vitalício.</p>'); // Just to match structure
    
    // In Affiliates, Mensal says "R$ 64,99" and "Plano Vitalício" which means it's swapped!!
    // Wait, let's look at the actual current content.
  }

  fs.writeFileSync(file, content, 'utf8');
});
