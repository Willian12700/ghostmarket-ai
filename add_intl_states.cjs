const fs = require('fs');

const file = 'src/pages/Scanner.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add COUNTRY_MAP and states
const countriesArrayRegex = /const COUNTRIES = \[[\s\S]*?\];/;
const replacement1 = `const COUNTRIES = [
  'Brasil', 'Estados Unidos', 'Portugal', 'Reino Unido', 'Austrália', 'Canadá', 
  'Espanha', 'França', 'Alemanha', 'Itália', 'Argentina', 'Chile', 'Colômbia', 'México'
];

const COUNTRY_MAP: Record<string, string> = {
  'Brasil': 'Brazil',
  'Estados Unidos': 'United States',
  'Portugal': 'Portugal',
  'Reino Unido': 'United Kingdom',
  'Austrália': 'Australia',
  'Canadá': 'Canada',
  'Espanha': 'Spain',
  'França': 'France',
  'Alemanha': 'Germany',
  'Itália': 'Italy',
  'Argentina': 'Argentina',
  'Chile': 'Chile',
  'Colômbia': 'Colombia',
  'México': 'Mexico'
};`;
content = content.replace(countriesArrayRegex, replacement1);

// 2. Add Intl States
const stateDefsRegex = /const \[customCity, setCustomCity\] = useState\(''\)/;
const replacement2 = `const [intlStates, setIntlStates] = useState<string[]>([])
  const [intlCities, setIntlCities] = useState<string[]>([])
  const [selectedIntlState, setSelectedIntlState] = useState('')
  const [selectedIntlCity, setSelectedIntlCity] = useState('')
  const [isLoadingIntl, setIsLoadingIntl] = useState(false)`;
content = content.replace(stateDefsRegex, replacement2);

// 3. Add Intl Effects
const ibgeEffectRegex = /useEffect\(\(\) => \{\s*if \(selectedState\).*?\n\s*\}\s*\}, \[selectedState\]\)/s;
const ibgeMatch = content.match(ibgeEffectRegex);
if (ibgeMatch) {
  const replacement3 = ibgeMatch[0] + `

  useEffect(() => {
    if (selectedCountry !== 'Brasil') {
      setIsLoadingIntl(true)
      fetch('https://countriesnow.space/api/v0.1/countries/states', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ country: COUNTRY_MAP[selectedCountry] })
      })
      .then(r => r.json())
      .then(d => {
        if (!d.error && d.data && d.data.states) {
          const s = d.data.states.map((st: any) => st.name);
          setIntlStates(s);
          setSelectedIntlState(s[0] || '');
        } else {
          setIntlStates([]);
          setSelectedIntlState('');
        }
        setIsLoadingIntl(false)
      })
      .catch(e => {
        console.error(e)
        setIsLoadingIntl(false)
      })
    }
  }, [selectedCountry])

  useEffect(() => {
    if (selectedCountry !== 'Brasil' && selectedIntlState) {
      setIsLoadingIntl(true)
      fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ country: COUNTRY_MAP[selectedCountry], state: selectedIntlState })
      })
      .then(r => r.json())
      .then(d => {
        if (!d.error && d.data) {
          setIntlCities(d.data);
          setSelectedIntlCity(d.data[0] || '');
        } else {
          setIntlCities([]);
          setSelectedIntlCity('');
        }
        setIsLoadingIntl(false)
      })
      .catch(e => {
        console.error(e)
        setIsLoadingIntl(false)
      })
    }
  }, [selectedIntlState, selectedCountry])`;
  content = content.replace(ibgeMatch[0], replacement3);
}

// 4. Update Query
const queryOld = "const query = selectedCountry === 'Brasil' ? `${niche} em ${selectedCity}, ${selectedState}, Brasil` : `${niche} in ${customCity}, ${selectedCountry}`;";
const queryNew = "const query = selectedCountry === 'Brasil' ? `${niche} em ${selectedCity}, ${selectedState}, Brasil` : `${niche} in ${selectedIntlCity}, ${selectedIntlState}, ${selectedCountry}`;";
content = content.replace(queryOld, queryNew);

// 5. Update JSX form
const formOldRegex = /<div className="space-y-2 col-span-2">[\s\S]*?<\/div>/;
const formNew = `<>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Estado/Região</label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedIntlState}
                    onChange={(e) => setSelectedIntlState(e.target.value)}
                    disabled={intlStates.length === 0 || isLoadingIntl}
                  >
                    {isLoadingIntl && intlStates.length === 0 ? (
                      <option value="">Carregando...</option>
                    ) : intlStates.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-textSecondary">Cidade</label>
                  {intlCities.length > 0 ? (
                    <select 
                      className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                      value={selectedIntlCity}
                      onChange={(e) => setSelectedIntlCity(e.target.value)}
                      disabled={isLoadingIntl}
                    >
                      {isLoadingIntl ? (
                        <option value="">Carregando...</option>
                      ) : intlCities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  ) : (
                    <Input 
                      value={selectedIntlCity}
                      onChange={(e) => setSelectedIntlCity(e.target.value)}
                      placeholder="Ex: Orlando"
                      disabled={isLoadingIntl}
                    />
                  )}
                </div>
              </>`;
              
content = content.replace(formOldRegex, formNew);

fs.writeFileSync(file, content, 'utf8');
