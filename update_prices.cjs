const fs = require('fs');
const path = require('path');

function updateFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated ' + filePath);
}

updateFile('src/pages/Landing.tsx', [
    ['R$ 29,99', 'R$ 19,99'],
    ['12x R$ 13,41', '12x R$ 5,17'],
    ['Ou R$ 129,99 à vista', 'Ou R$ 49,99 à vista']
]);

updateFile('src/pages/QuizPublic.tsx', [
    ['R$ 29,99', 'R$ 19,99']
]);

updateFile('quiz-ghost-market.html', [
    ['R$ 29,99', 'R$ 19,99']
]);

updateFile('src/components/ui/AppPreview.tsx', [
    ['+R$ 29,99', '+R$ 19,99']
]);

updateFile('src/pages/Affiliates.tsx', [
    ['14,99', '9,99']
]);
