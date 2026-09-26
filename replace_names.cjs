const fs = require('fs');

let code = fs.readFileSync('src/components/ui/AppPreview.tsx', 'utf8');

const oldArray = `[
                    { name: "Nicollas Clean ...", tag: "SAAS", val: "+R$ 29,99" },
                    { name: "Davi dos Santo...", tag: "SAAS", val: "+R$ 29,99" },
                    { name: "Pedro Elias Ferr...", tag: "SAAS", val: "+R$ 29,99" },
                    { name: "MS Barbearia", tag: "SAAS", val: "+R$ 200,00", blur: true }
                  ]`;

const newArray = `[
                    { name: "Lucas Fernandes...", tag: "SAAS", val: "+R$ 29,99" },
                    { name: "Marina Designer...", tag: "SAAS", val: "+R$ 29,99" },
                    { name: "Agência Vórtice", tag: "SAAS", val: "+R$ 29,99" },
                    { name: "Roberto Mendes...", tag: "SAAS", val: "+R$ 200,00", blur: true }
                  ]`;

code = code.replace(oldArray, newArray);

fs.writeFileSync('src/components/ui/AppPreview.tsx', code, 'utf8');
