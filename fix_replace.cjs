const fs = require('fs');

const file = 'src/pages/Scanner.tsx';
let content = fs.readFileSync(file, 'utf8');

const startTag = '<div className="space-y-2">';
const endTag = '</select>\n            </div>';

const idx1 = content.indexOf('<div className="space-y-2">\n              <label className="text-sm font-medium text-textSecondary">Estado</label>');

if (idx1 !== -1) {
   // find the second endTag
   const endIdx1 = content.indexOf('</select>\n            </div>', idx1);
   const endIdx2 = content.indexOf('</select>\n            </div>', endIdx1 + 10);
   
   if (endIdx2 !== -1) {
     const toReplace = content.substring(idx1, endIdx2 + 28);
     
const formFieldsNew = `<div className="space-y-2">
              <label className="text-sm font-medium text-textSecondary">País</label>
              <select 
                className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
            
            {selectedCountry === 'Brasil' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Estado</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    {states.map(state => (
                      <option key={state.id} value={state.sigla}>{state.nome}</option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Cidade</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    disabled={cities.length === 0}
                  >
                    {cities.map(city => (
                      <option key={city.id} value={city.nome}>{city.nome}</option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium text-textSecondary">Cidade / Região</label>
                <Input 
                  value={customCity}
                  onChange={(e) => setCustomCity(e.target.value)}
                  placeholder="Ex: Orlando, FL"
                />
              </div>
            )}`;

     content = content.replace(toReplace, formFieldsNew);
     fs.writeFileSync(file, content, 'utf8');
   }
}
