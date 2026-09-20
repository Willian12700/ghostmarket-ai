const fs = require('fs');

// Patch SiteBuilder.tsx
let builder = fs.readFileSync('src/pages/SiteBuilder.tsx', 'utf8');
const builderAdd = `
      {block.type === 'custom-html' && (
        <div 
          className="w-full text-left"
          dangerouslySetInnerHTML={{ __html: block.content.html }} 
        />
      )}
`;
builder = builder.replace('{block.type === \'hero\' && (', builderAdd + '\n      {block.type === \'hero\' && (');
fs.writeFileSync('src/pages/SiteBuilder.tsx', builder, 'utf8');

// Patch SiteViewer.tsx
let viewer = fs.readFileSync('src/pages/SiteViewer.tsx', 'utf8');
const viewerAdd = `
          {block.type === 'custom-html' && (
            <div dangerouslySetInnerHTML={{ __html: block.content.html }} />
          )}
`;
viewer = viewer.replace('{block.type === \'hero\' && (', viewerAdd + '\n          {block.type === \'hero\' && (');
fs.writeFileSync('src/pages/SiteViewer.tsx', viewer, 'utf8');

// Patch index.html
let html = fs.readFileSync('index.html', 'utf8');
if (!html.includes('cdn.tailwindcss.com')) {
  html = html.replace('</head>', '  <script src="https://cdn.tailwindcss.com"></script>\n  </head>');
  fs.writeFileSync('index.html', html, 'utf8');
}
