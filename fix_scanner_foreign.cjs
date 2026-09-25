const fs = require('fs');

const file = 'src/pages/Scanner.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Fix the API fields
content = content.replace(
  "fields: ['id', 'displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'rating', 'userRatingCount'],",
  "fields: ['id', 'displayName', 'formattedAddress', 'nationalPhoneNumber', 'internationalPhoneNumber', 'websiteURI', 'rating', 'userRatingCount'],"
);

// 2. Fix the city map and phone logic
const oldMapStart = `const realLeads: Lead[] = places.map((place: any) => {
        let phone = place.nationalPhoneNumber || '';
        phone = String(phone).replace(/\\D/g, '');`;

const newMapStart = `const actualCity = selectedCountry === 'Brasil' ? selectedCity : selectedIntlCity;
        
        const realLeads: Lead[] = places.map((place: any) => {
        let phone = place.internationalPhoneNumber || place.nationalPhoneNumber || '';
        phone = String(phone).replace(/\\D/g, '');
        // fallback para o Brasil se por acaso só vier o national:
        if (selectedCountry === 'Brasil' && phone.length <= 11) {
            phone = '55' + phone;
        }`;

content = content.replace(oldMapStart, newMapStart);

// 3. Fix the hardcoded city in the return object
const oldReturnObj = `return {
          id: place.id,
          name: place.displayName || niche,
          category: niche,
          city: selectedCity,`;

const newReturnObj = `return {
          id: place.id,
          name: place.displayName || niche,
          category: niche,
          city: actualCity,`;

content = content.replace(oldReturnObj, newReturnObj);

// 4. Fix the wa.me link
content = content.replace(
  "href={`https://wa.me/55${lead.phone}?text=${generateWhatsAppMessage(lead)}`}",
  "href={`https://wa.me/${lead.phone}?text=${generateWhatsAppMessage(lead)}`}"
);

fs.writeFileSync(file, content, 'utf8');
