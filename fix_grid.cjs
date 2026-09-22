const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// The block to move starts with:
// {/* TOP METRICS GRID (4 CARDS) */}
// and ends right before:
// {/* BOTTOM SECTION */}
const startIdx = content.indexOf('{/* TOP METRICS GRID (4 CARDS) */}');
const endIdx = content.indexOf('{/* BOTTOM SECTION */}');

if (startIdx !== -1 && endIdx !== -1) {
  let block = content.substring(startIdx, endIdx);
  
  // modify block to add lg:col-span-3
  block = block.replace('className="flex flex-col gap-4"', 'className="flex flex-col gap-4 lg:col-span-3"');

  // remove block from current pos
  content = content.replace(block, '');

  // insert inside the bottom grid
  const gridStart = 'className="grid gap-6 grid-cols-1 lg:grid-cols-12"\n      >';
  const insertIdx = content.indexOf(gridStart) + gridStart.length;

  content = content.substring(0, insertIdx) + '\n        ' + block + content.substring(insertIdx);
  
  fs.writeFileSync('src/pages/Dashboard.tsx', content, 'utf8');
} else {
  console.log("Could not find blocks");
}
