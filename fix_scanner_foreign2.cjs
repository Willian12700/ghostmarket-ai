const fs = require('fs');

const file = 'src/pages/Scanner.tsx';
let content = fs.readFileSync(file, 'utf8');

const fieldsOld = "fields: ['id', 'displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'rating', 'userRatingCount'],";
const fieldsNew = "fields: ['id', 'displayName', 'formattedAddress', 'nationalPhoneNumber', 'internationalPhoneNumber', 'websiteURI', 'rating', 'userRatingCount'],";
content = content.replace(fieldsOld, fieldsNew);

const oldMapRegex = /const realLeads: Lead\[\] = places\.map\(\(place: any\) => \{\s*let phone = place\.nationalPhoneNumber \|\| '';\s*phone = String\(phone\)\.replace\(\/\\D\/g, ''\);\s*/;
const newMap = `const actualCity = selectedCountry === 'Brasil' ? selectedCity : selectedIntlCity;
      
      const realLeads: Lead[] = places.map((place: any) => {
        let phone = place.internationalPhoneNumber || place.nationalPhoneNumber || '';
        phone = String(phone).replace(/\\D/g, '');
        // fallback para o Brasil se por acaso só vier o national:
        if (selectedCountry === 'Brasil' && phone.length <= 11) {
            phone = '55' + phone;
        }
        `;
content = content.replace(oldMapRegex, newMap);

const returnCityRegex = /city: selectedCity,/;
const returnCityNew = `city: actualCity,`;
content = content.replace(returnCityRegex, returnCityNew);

const waRegex = /href=\{\`https:\/\/wa\.me\/55\$\{lead\.phone\}\?text=\$\{generateWhatsAppMessage\(lead\)\}\`\}/g;
const waNew = `href={\`https://wa.me/\${lead.phone}?text=\${generateWhatsAppMessage(lead)}\`}`;
content = content.replace(waRegex, waNew);

fs.writeFileSync(file, content, 'utf8');
