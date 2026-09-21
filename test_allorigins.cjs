const url = "https://produto.mercadolivre.com.br/MLB-6238909650-produto";
fetch('https://api.allorigins.win/get?url=' + encodeURIComponent(url))
  .then(r => r.json())
  .then(data => {
    const html = data.contents;
    
    // Check if it's an error page or CAPTCHA
    if (html.includes('verificamos que você não é um robô')) {
      console.log('BLOCKED BY ML CAPTCHA');
      return;
    }

    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const priceMatch = html.match(/<meta itemprop="price" content="([^"]+)"/);
    const imgMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    
    console.log('Title:', titleMatch ? titleMatch[1] : 'Not found');
    console.log('Price:', priceMatch ? priceMatch[1] : 'Not found');
    console.log('Image:', imgMatch ? imgMatch[1] : 'Not found');
  })
  .catch(console.error);
