const fs = require('fs');

let file = fs.readFileSync('src/pages/Ranking.tsx', 'utf8');

// 1. Add isSuspended to RankedUser interface
file = file.replace(
  "totalSales: number\n}",
  "totalSales: number\n  isSuspended?: boolean\n}"
);

// 2. Add isSuspended to userObj creation
file = file.replace(
  "totalSales: 0\n          }",
  "totalSales: 0,\n            isSuspended: data.isSuspended === true\n          }"
);

// 3. Filter out suspended users
file = file.replace(
  "const uniqueUsers = Array.from(new Set(Object.values(usersMap)))",
  "const uniqueUsers = Array.from(new Set(Object.values(usersMap))).filter(u => !u.isSuspended)"
);

fs.writeFileSync('src/pages/Ranking.tsx', file, 'utf8');
console.log('Filtered out suspended users');
