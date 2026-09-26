const fs = require('fs');

let code = fs.readFileSync('src/components/ui/AppPreview.tsx', 'utf8');

// 1. App Layout height and direction
code = code.replace('className="flex h-[600px] bg-[#050505]"', 'className="flex flex-col lg:flex-row h-[800px] lg:h-[600px] bg-[#050505]"');

// 2. Hide sidebar on mobile
code = code.replace('className="w-[240px] shrink-0 border-r border-white/5 flex flex-col p-4 overflow-y-hidden relative bg-[#050505]"', 'className="hidden lg:flex w-[240px] shrink-0 border-r border-white/5 flex-col p-4 overflow-y-hidden relative bg-[#050505]"');

// 3. Grid cols responsive
// There is likely a line like `<div className="grid grid-cols-12 gap-6 relative z-10">`
code = code.replace('className="grid grid-cols-12 gap-6 relative z-10"', 'className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10"');

// 4. Col spans responsive
code = code.replace('className="col-span-3 flex flex-col gap-6"', 'className="col-span-1 lg:col-span-3 flex flex-col gap-6"');
code = code.replace('className="col-span-5 bg-[#0b0714] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col"', 'className="col-span-1 lg:col-span-5 bg-[#0b0714] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col"');
code = code.replace('className="col-span-4 bg-[#0b0714] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col"', 'className="col-span-1 lg:col-span-4 bg-[#0b0714] border border-white/5 rounded-2xl p-6 relative overflow-hidden flex flex-col"');

// 5. Header Area layout (Hello, User Test) - stacking on mobile
code = code.replace('className="flex items-start justify-between"', 'className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-0"');

// 6. Fix "Auto-Cálculo de Meta" flex direction if needed
code = code.replace('className="flex flex-col md:flex-row justify-between gap-8"', 'className="flex flex-col md:flex-row justify-between gap-4 md:gap-8"');

// 7. Ensure Main Content scrolls on mobile
// In <div className="flex-1 flex flex-col bg-[#050505] overflow-y-auto overflow-x-hidden relative">
// This is already fine because of overflow-y-auto, but the parent App Layout should not cut it off.

fs.writeFileSync('src/components/ui/AppPreview.tsx', code, 'utf8');
