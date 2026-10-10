const fs = require('fs');
let c = fs.readFileSync('src/pages/QuizPublic.tsx', 'utf8');

c = c.replace(/href=\{CFG\.checkoutGhost\}\s*onClick=\{\(e\) => handleCheckoutRedirect\(e, 'Ghost AI', CFG\.checkoutGhost\)\}/g, 
  "href=\"/\" onClick={(e) => { e.preventDefault(); trackEvent('quiz_offer_clicked', { offer: 'Ghost AI' }); window.location.href = '/'; }}"
);

c = c.replace(/href=\{CFG\.checkoutMentoria\}\s*onClick=\{\(e\) => handleCheckoutRedirect\(e, 'Vital.*?cio', CFG\.checkoutMentoria\)\}/g, 
  "href=\"/\" onClick={(e) => { e.preventDefault(); trackEvent('quiz_offer_clicked', { offer: 'Vitalício' }); window.location.href = '/'; }}"
);

// Fix the /mês error that happened before due to encoding
c = c.replace(/\/m\u01E6s/g, "/mês");
c = c.replace(/\/m.s/g, "/mês");

fs.writeFileSync('src/pages/QuizPublic.tsx', c, 'utf8');
