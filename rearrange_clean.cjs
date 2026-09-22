const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// The original file is structured like this:
/*
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* HEADER SECTION *\/}
      <motion.div ...>...</motion.div>

      {/* TOP METRICS GRID (4 CARDS) *\/}
      <motion.div ...>
         ...
      </motion.div>

      {/* GHOST GOAL AUTO-TRACKING *\/}
      <motion.div ...>
         ...
      </motion.div>

      {/* BOTTOM SECTION *\/}
      <motion.div ...>
        {/* CHART BLOCK *\/}
        ...
        {/* RECENT TRANSACTIONS BLOCK *\/}
        ...
      </motion.div>
    </div>
  )
*/

// STEP 1: Find block ranges
const getRange = (startMarker, endMarker) => {
    const startIdx = content.indexOf(startMarker);
    const endIdx = content.indexOf(endMarker, startIdx);
    if (startIdx === -1 || endIdx === -1) throw new Error("Marker not found: " + startMarker);
    return { start: startIdx, end: endIdx };
};

const headerR = getRange('{/* HEADER SECTION */}', '{/* TOP METRICS GRID (4 CARDS) */}');
const metricsR = getRange('{/* TOP METRICS GRID (4 CARDS) */}', '{/* GHOST GOAL AUTO-TRACKING */}');
const goalR = getRange('{/* GHOST GOAL AUTO-TRACKING */}', '{/* BOTTOM SECTION */}');
const bottomR = getRange('{/* BOTTOM SECTION */}', '    </div>\n  )\n}');

const headerBlock = content.substring(headerR.start, headerR.end);
const metricsBlock = content.substring(metricsR.start, metricsR.end);
const goalBlock = content.substring(goalR.start, goalR.end);
const bottomBlock = content.substring(bottomR.start, bottomR.end);

// STEP 2: Rewrite inside elements
let modifiedMetrics = metricsBlock.replace(
    'className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"',
    'className="flex flex-col gap-4 lg:col-span-3"'
);

let modifiedBottom = bottomBlock;
// Change bottom grid from 7 cols to 12 cols
modifiedBottom = modifiedBottom.replace(
    'className="grid gap-6 md:grid-cols-7"',
    'className="grid gap-6 grid-cols-1 lg:grid-cols-12"'
);
// Change chart from col-span-5 to col-span-6
modifiedBottom = modifiedBottom.replace(
    'md:col-span-5 bg-panel',
    'lg:col-span-6 bg-panel'
);
// Change transactions from col-span-2 to col-span-3
modifiedBottom = modifiedBottom.replace(
    'md:col-span-2 bg-panel',
    'lg:col-span-3 bg-panel'
);

// Inject the metrics block INSIDE the modified bottom block grid
// The bottom block has a motion.div that starts the grid.
const gridStartPattern = 'className="grid gap-6 grid-cols-1 lg:grid-cols-12"\n      >';
const gridStartIdx = modifiedBottom.indexOf(gridStartPattern);
if (gridStartIdx !== -1) {
    const insertPos = gridStartIdx + gridStartPattern.length;
    modifiedBottom = modifiedBottom.substring(0, insertPos) + '\n        ' + modifiedMetrics + modifiedBottom.substring(insertPos);
} else {
    throw new Error("Could not find bottom grid start");
}

// STEP 3: Combine all parts in the new order
const newReturn = 
`  return (
    <div className="max-w-[1400px] w-full mx-auto space-y-6">
      
      ` + headerBlock + `

      ` + goalBlock + `

      ` + modifiedBottom + `
    </div>
  )
}
`;

// Replace the entire return statement
const returnIdx = content.indexOf('  return (');
content = content.substring(0, returnIdx) + newReturn;

fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
