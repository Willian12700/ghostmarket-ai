const fs = require('fs');

let code = fs.readFileSync('src/pages/Landing.tsx', 'utf8');

code = code.replace(
  '<AppPreview />',
  `<div className="w-full overflow-x-auto pb-4 custom-scrollbar snap-x">
                  <div className="min-w-[900px] md:min-w-full px-4 md:px-0 snap-center">
                    <AppPreview />
                  </div>
                </div>`
);

fs.writeFileSync('src/pages/Landing.tsx', code, 'utf8');
