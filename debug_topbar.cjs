const fs = require('fs');
let content = fs.readFileSync('src/components/layout/Topbar.tsx', 'utf8');

// I need to import toast in Topbar if it's not there. Actually, let's just use alert.
const oldErr = `      }, (error) => {
      console.error("Erro ao buscar notificaes:", error)
      setLoading(false)
    })`;

const newErr = `      }, (error) => {
      console.error("Erro ao buscar notificaçoes:", error)
      alert("ERRO NO SININHO: " + error.message)
      setLoading(false)
    })`;

content = content.replace(oldErr, newErr);
fs.writeFileSync('src/components/layout/Topbar.tsx', content, 'utf8');
