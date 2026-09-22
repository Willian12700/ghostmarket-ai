const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// We need to move {/* GHOST GOAL AUTO-TRACKING */} BEFORE {/* TOP METRICS GRID (4 CARDS) */}
const goalStart = content.indexOf('{/* GHOST GOAL AUTO-TRACKING */}');
if (goalStart !== -1) {
    const goalEnd = content.indexOf('{/* BOTTOM SECTION */}');
    const goalBlock = content.substring(goalStart, goalEnd);
    
    // Remove goal block from its original position
    content = content.replace(goalBlock, '');
    
    // Insert goal block BEFORE metrics grid
    const metricsStart = content.indexOf('{/* TOP METRICS GRID (4 CARDS) */}');
    content = content.substring(0, metricsStart) + goalBlock + '\n      ' + content.substring(metricsStart);
}

// Now wrap Metrics, Chart, and Transactions in a 12-col grid.
// Currently, metrics is inside a motion.div
content = content.replace(
    /className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"/g,
    'className="flex flex-col gap-4"'
);

// We want to put metrics inside the lg:col-span-3 of a new grid.
// Bottom section has <motion.div className="grid gap-6 md:grid-cols-7">
content = content.replace(
    /className="grid gap-6 md:grid-cols-7"/g,
    'className="grid gap-6 grid-cols-1 lg:grid-cols-12"'
);

// Chart Block col-span
content = content.replace(
    /className="md:col-span-5 bg-panel/g,
    'className="lg:col-span-6 bg-panel'
);

// Transactions Block col-span
content = content.replace(
    /className="md:col-span-2 bg-panel/g,
    'className="lg:col-span-3 bg-panel'
);

// Move the metrics block INSIDE the bottom section grid!
const metricsStart2 = content.indexOf('{/* TOP METRICS GRID (4 CARDS) */}');
const metricsEndStr = '</motion.div>\n\n      {/* BOTTOM SECTION */}';
const metricsEnd2 = content.indexOf(metricsEndStr);

if (metricsStart2 !== -1 && metricsEnd2 !== -1) {
    let metricsBlock2 = content.substring(metricsStart2, metricsEnd2 + '</motion.div>'.length);
    
    // Remove metrics block from top
    content = content.replace(metricsBlock2 + '\n\n      {/* BOTTOM SECTION */}', '{/* BOTTOM SECTION */}');
    
    // Now metricsBlock2 needs to be wrapped in lg:col-span-3 and inserted into the bottom grid.
    const bottomGridStartStr = 'className="grid gap-6 grid-cols-1 lg:grid-cols-12"\n      >';
    const bottomGridStartIdx = content.indexOf(bottomGridStartStr);
    
    if (bottomGridStartIdx !== -1) {
        const insertIdx = bottomGridStartIdx + bottomGridStartStr.length;
        
        // Let's modify metricsBlock2 to have lg:col-span-3
        metricsBlock2 = metricsBlock2.replace('<motion.div ', '<motion.div className="lg:col-span-3" ');
        
        content = content.substring(0, insertIdx) + '\n        ' + metricsBlock2 + content.substring(insertIdx);
    }
}

fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
