const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const returnIdx = content.indexOf('  return (');
const jsLogic = content.substring(0, returnIdx);
let tsxContent = content.substring(returnIdx);

const headerBlock = tsxContent.split('{/* TOP METRICS GRID (4 CARDS) */}')[0];
let rest = '{/* TOP METRICS GRID (4 CARDS) */}' + tsxContent.split('{/* TOP METRICS GRID (4 CARDS) */}')[1];

const metricsBlock = rest.split('{/* GHOST GOAL AUTO-TRACKING */}')[0];
rest = '{/* GHOST GOAL AUTO-TRACKING */}' + rest.split('{/* GHOST GOAL AUTO-TRACKING */}')[1];

const goalBlock = rest.split('{/* BOTTOM SECTION */}')[0];
const bottomBlock = '{/* BOTTOM SECTION */}' + rest.split('{/* BOTTOM SECTION */}')[1];

// Modify metrics
let modifiedMetrics = metricsBlock.replace(
    'className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"',
    'className="flex flex-col gap-4 lg:col-span-3"'
);

// Modify bottom
let modifiedBottom = bottomBlock;
modifiedBottom = modifiedBottom.replace(
    'className="grid gap-6 md:grid-cols-7"',
    'className="grid gap-6 grid-cols-1 lg:grid-cols-12"'
);
modifiedBottom = modifiedBottom.replace(
    'md:col-span-5 bg-panel',
    'lg:col-span-6 bg-panel'
);
modifiedBottom = modifiedBottom.replace(
    'md:col-span-2 bg-panel',
    'lg:col-span-3 bg-panel'
);

// Inject metrics inside bottom
const gridStartPattern = 'className="grid gap-6 grid-cols-1 lg:grid-cols-12"\n      >';
const gridStartIdx = modifiedBottom.indexOf(gridStartPattern);

// Fallback if line endings cause issues
const gridStartMatch = modifiedBottom.match(/className="grid gap-6 grid-cols-1 lg:grid-cols-12"[\s\S]*?>/);
if (gridStartMatch) {
    const insertPos = gridStartMatch.index + gridStartMatch[0].length;
    modifiedBottom = modifiedBottom.substring(0, insertPos) + '\n        ' + modifiedMetrics + modifiedBottom.substring(insertPos);
}

const newReturn = headerBlock.replace('max-w-7xl', 'max-w-[1400px] w-full') + goalBlock + modifiedBottom;

fs.writeFileSync('src/pages/Dashboard.tsx', jsLogic + newReturn, 'utf8');
