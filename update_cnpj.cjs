const fs = require('fs');

let code = fs.readFileSync('src/pages/CnpjScanner.tsx', 'utf8');

const formatPhoneLogic = `
  const formatPhone = (phoneStr: string) => {
    if (!phoneStr) return 'Não cadastrado';
    let p = phoneStr.replace(/\\D/g, '');
    if (p.length === 10) {
      const ddd = p.substring(0, 2);
      const num = p.substring(2);
      if (['6','7','8','9'].includes(num[0])) {
        return \`(\${ddd}) 9\${num.substring(0,4)}-\${num.substring(4)}\`;
      }
      return \`(\${ddd}) \${num.substring(0,4)}-\${num.substring(4)}\`;
    }
    if (p.length === 11) {
      const ddd = p.substring(0, 2);
      const num = p.substring(2);
      return \`(\${ddd}) \${num.substring(0,5)}-\${num.substring(5)}\`;
    }
    return phoneStr;
  };

  const getDonoName = (data: CnpjData) => {
    if (data.qsa && data.qsa.length > 0) {
      return data.qsa.map(q => q.nome_socio).join(', ');
    }
    // Remove os números de CPF que ficam no final da Razão Social do MEI
    let nome = data.razao_social.replace(/\\d+$/, '').trim();
    return nome;
  };
`;

// Inject the helper functions
code = code.replace(
  "const formatDataToCopy = (data: CnpjData) => {",
  formatPhoneLogic + "\n  const formatDataToCopy = (data: CnpjData) => {"
);

// Update copy formatting
code = code.replace(
  "text += `*Telefone de Contato:* ${data.ddd_telefone_1 || 'Não informado'}\\n`",
  "text += `*Nome do Dono (Sócio/Responsável):* ${getDonoName(data)}\\n`\n    text += `*Telefone de Contato:* ${formatPhone(data.ddd_telefone_1)}\\n`"
);

// Update UI
code = code.replace(
  "<h4 className=\"text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1\"><Phone className=\"w-3 h-3\" /> Telefone de Contato</h4>",
  "<h4 className=\"text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1\"><User className=\"w-3 h-3\" /> Nome do Dono (Responsável)</h4>\n                      <p className=\"text-white bg-[#0b0714] p-3 rounded-lg border border-[#261f36] font-medium mb-4\">\n                        {getDonoName(result)}\n                      </p>\n                      <h4 className=\"text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-1\"><Phone className=\"w-3 h-3\" /> Telefone de Contato</h4>"
);

code = code.replace(
  "{result.ddd_telefone_1 || 'Não cadastrado'}",
  "{formatPhone(result.ddd_telefone_1)}"
);

// We need to add the User icon
if (!code.includes('User,')) {
  code = code.replace("import { Search, Building2, Copy, Check, MapPin, Calendar, Briefcase, Phone, Users } from 'lucide-react'", "import { Search, Building2, Copy, Check, MapPin, Calendar, Briefcase, Phone, Users, User } from 'lucide-react'");
}

// Fix backtick escape issue for UI class replacement (just in case)
code = code.replace(/\\`/g, '`');
code = code.replace(/\\\$/g, '$');

fs.writeFileSync('src/pages/CnpjScanner.tsx', code, 'utf8');
