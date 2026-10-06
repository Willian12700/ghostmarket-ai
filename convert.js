const fs = require('fs');

function htmlToJsx(html) {
  let jsx = html;
  jsx = jsx.replace(/class=/g, 'className=');
  jsx = jsx.replace(/tabindex=/g, 'tabIndex=');
  jsx = jsx.replace(/for=/g, 'htmlFor=');
  jsx = jsx.replace(/stroke-width/g, 'strokeWidth');
  jsx = jsx.replace(/stroke-linecap/g, 'strokeLinecap');
  jsx = jsx.replace(/stroke-linejoin/g, 'strokeLinejoin');
  
  jsx = jsx.replace(/style="([^"]*)"/g, (match, p1) => {
    let styleObj = {};
    p1.split(';').forEach(s => {
      let parts = s.split(':');
      if (parts.length === 2) {
        let key = parts[0].trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
        styleObj[key] = parts[1].trim();
      }
    });
    return 'style={' + JSON.stringify(styleObj) + '}';
  });
  
  jsx = jsx.replace(/<img([^>]*?[^\/])>/g, '<img$1 />');
  jsx = jsx.replace(/<input([^>]*?[^\/])>/g, '<input$1 />');
  jsx = jsx.replace(/<br([^>]*?[^\/])>/g, '<br$1 />');
  jsx = jsx.replace(/<hr([^>]*?[^\/])>/g, '<hr$1 />');
  jsx = jsx.replace(/<!--[\s\S]*?-->/g, '');
  jsx = jsx.replace(/<script[\s\S]*?<\/script>/g, '');
  
  return jsx;
}

const pHtml = fs.readFileSync('crm_pipeline.html', 'utf-8');
let jsx = htmlToJsx(pHtml);
// Fix style background url
jsx = jsx.replace(/style=\{\{"backgroundImage":"url\('([^']+)'\)"\}\}/g, 'style={{backgroundImage: `url($1)`}}');
// Fix another background url pattern
jsx = jsx.replace(/style=\{\{"background-image":"url\('([^']+)'\)"\}\}/g, 'style={{backgroundImage: `url($1)`}}');

fs.writeFileSync('crm_pipeline.jsx', jsx, 'utf-8');
console.log('Done');
