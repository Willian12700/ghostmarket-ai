const fs = require('fs');

const file = 'src/pages/Scanner.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state variable for country and custom city
const stateImportText = `const [selectedCity, setSelectedCity] = useState('São Paulo')`;
const newStates = `const [selectedCountry, setSelectedCountry] = useState('Brasil')
  const [customCity, setCustomCity] = useState('')
  const [selectedCity, setSelectedCity] = useState('São Paulo')`;

content = content.replace(stateImportText, newStates);

// 2. Add countries array above the component
const componentDecl = `export const Scanner = () => {`;
const countriesArray = `
const COUNTRIES = [
  'Brasil', 'Estados Unidos', 'Portugal', 'Reino Unido', 'Austrália', 'Canadá', 
  'Espanha', 'França', 'Alemanha', 'Itália', 'Argentina', 'Chile', 'Colômbia', 'México'
];

export const Scanner = () => {`;
content = content.replace(componentDecl, countriesArray);

// 3. Update handleScan
const queryOld = "const query = `${niche} em ${selectedCity}, ${selectedState}, Brasil`;";
const queryNew = "const query = selectedCountry === 'Brasil' ? `${niche} em ${selectedCity}, ${selectedState}, Brasil` : `${niche} in ${customCity}, ${selectedCountry}`;";
content = content.replace(queryOld, queryNew);

// 4. Update the Grid
const gridOld = `<div className="grid gap-4 md:grid-cols-4 items-end">`;
const gridNew = `<div className="grid gap-4 md:grid-cols-5 items-end">`;
content = content.replace(gridOld, gridNew);

// 5. Update the form fields
const formFieldsOld = `<div className="space-y-2">
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
            </div>`;

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

content = content.replace(formFieldsOld, formFieldsNew);

// Since the new layout uses fragments, we need to make sure the Grid stays balanced. 
// md:grid-cols-5. 
// País (1) + [Estado (1) + Cidade (1)] = 3. 
// Nicho (1) + Button (1) = 5! Perfect for Brazil.
// If not Brazil: País (1) + Cidade/Região (2) = 3. 
// Nicho (1) + Button (1) = 5! Perfect for Foreign.

fs.writeFileSync(file, content, 'utf8');
