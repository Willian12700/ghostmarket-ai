const fs = require('fs');
let builder = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');

builder = builder.replace(
  `          <div className={\`transition-all duration-500 ease-in-out border border-border rounded-xl bg-panel shadow-2xl overflow-hidden relative \${activeView === 'mobile' ? 'w-[375px] min-h-[812px]' : 'w-full max-w-5xl min-h-[800px]'}\`}>`,
  `          <div className={\`transition-all duration-500 ease-in-out border border-border rounded-xl bg-panel shadow-2xl overflow-hidden relative \${activeView === 'mobile' ? 'w-[375px] min-h-[812px] ring-[12px] ring-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] mt-4 mb-8' : 'w-full max-w-5xl min-h-[800px]'}\`}>
            {activeView === 'mobile' && (
              <div className="absolute top-0 inset-x-0 h-7 bg-zinc-900 z-50 flex justify-center rounded-b-3xl w-[150px] mx-auto">
                <div className="w-16 h-4 bg-black rounded-full mt-1.5 opacity-50"></div>
              </div>
            )}`
);

fs.writeFileSync('src/pages/SiteBuilder.tsx', builder);
