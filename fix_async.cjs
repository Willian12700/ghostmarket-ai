const fs = require('fs');
let content = fs.readFileSync('src/pages/Settings.tsx', 'utf8');

content = content.replace("img.onload = () => {", "img.onload = async () => {");
content = content.replace("img.onload = () => {", "img.onload = async () => {"); // Run twice just in case

fs.writeFileSync('src/pages/Settings.tsx', content);
