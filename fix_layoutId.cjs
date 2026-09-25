const fs = require('fs');
let content = fs.readFileSync('src/pages/PromptBuilder.tsx', 'utf8');

// Fix layoutId for PillSelector
content = content.replace(
  'const PillSelector = ({ options, value, onChange }: { options: string[], value: string, onChange: (val: string) => void }) => (',
  'const PillSelector = ({ id, options, value, onChange }: { id: string, options: string[], value: string, onChange: (val: string) => void }) => ('
);

content = content.replace(
  'layoutId="activePill"',
  'layoutId={`activePill-${id}`}'
);

// Update calls
content = content.replace('<PillSelector options={availableNiches}', '<PillSelector id="niches" options={availableNiches}');
content = content.replace('<PillSelector options={SYSTEM_TYPES}', '<PillSelector id="systemTypes" options={SYSTEM_TYPES}');
content = content.replace('<PillSelector options={TARGET_AUDIENCES}', '<PillSelector id="audiences" options={TARGET_AUDIENCES}');
content = content.replace('<PillSelector options={TONES}', '<PillSelector id="tones" options={TONES}');
content = content.replace('<PillSelector options={DESIGNS}', '<PillSelector id="designs" options={DESIGNS}');
content = content.replace('<PillSelector options={TECHS}', '<PillSelector id="techs" options={TECHS}');

fs.writeFileSync('src/pages/PromptBuilder.tsx', content, 'utf8');
