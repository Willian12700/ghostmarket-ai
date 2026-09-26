const fs = require('fs');

let code = fs.readFileSync('src/pages/Scanner.tsx', 'utf8');

// Add imageUrl to Lead
if (!code.includes('imageUrl?: string')) {
  code = code.replace(/status: 'Novo' \| 'Contatado'/, "status: 'Novo' | 'Contatado'\n  imageUrl?: string");
}

// Add photos to fields
code = code.replace(
  /fields: \['id', 'displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'rating', 'userRatingCount'\]/,
  "fields: ['id', 'displayName', 'formattedAddress', 'nationalPhoneNumber', 'websiteURI', 'rating', 'userRatingCount', 'photos']"
);

// Map imageUrl
const mapRegex = /const realLeads: Lead\[\] = places\.map\(\(place: any\) => \{/;
const mapReplacement = `const realLeads: Lead[] = places.map((place: any) => {
          let imageUrl = '';
          if (place.photos && place.photos.length > 0) {
            try {
              if (typeof place.photos[0].getURI === 'function') {
                imageUrl = place.photos[0].getURI({maxWidth: 600});
              } else if (place.photos[0].name) {
                // Se for a API REST nova sem o getURI
                imageUrl = \`https://places.googleapis.com/v1/\${place.photos[0].name}/media?maxHeightPx=400&maxWidthPx=600&key=\${import.meta.env.VITE_FIREBASE_API_KEY}\`;
              }
            } catch(e) {}
          }`;

if (!code.includes("let imageUrl = '';")) {
  code = code.replace(mapRegex, mapReplacement);
}

// Add imageUrl to the returned Lead object
code = code.replace(
  /userRatingsTotal: place\.userRatingCount \|\| 0,\n\s*status: 'Novo'/,
  "userRatingsTotal: place.userRatingCount || 0,\n            status: 'Novo',\n            imageUrl"
);

// Update Card rendering to show the image
const cardRegex = /<Card key=\{lead\.id\} className="hover:border-primary\/50 transition-colors flex flex-col relative overflow-hidden">/;
const cardReplacement = `<Card key={lead.id} className="hover:border-primary/50 transition-colors flex flex-col relative overflow-hidden">
              {lead.imageUrl && lead.id !== 'error' && (
                <div className="w-full h-32 bg-surface-elevated shrink-0 border-b border-border overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                  <img src={lead.imageUrl} alt={lead.name} className="w-full h-full object-cover" />
                </div>
              )}`;

if (!code.includes("img src={lead.imageUrl}")) {
  code = code.replace(cardRegex, cardReplacement);
}

fs.writeFileSync('src/pages/Scanner.tsx', code, 'utf8');
