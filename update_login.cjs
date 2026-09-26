const fs = require('fs');
let code = fs.readFileSync('src/pages/Login.tsx', 'utf8');
const trialBtn = `<div className="mt-6 text-center"><button type="button" onClick={() => navigate('/trial')} className="text-sm text-blue-400 hover:text-blue-300 font-medium underline underline-offset-4">Tenho um código de teste (5 Minutos)</button></div>`;
code = code.replace('</form>', '</form>\n' + trialBtn);
fs.writeFileSync('src/pages/Login.tsx', code, 'utf8');
