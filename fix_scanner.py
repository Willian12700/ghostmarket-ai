import codecs

with codecs.open('src/pages/Scanner.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacement = '''
      // FILTRAGEM ESTRITA: Garante que o lead realmente pertence ao estado e à cidade pesquisada
      const strictPlaces = places.filter((place: any) => {
        if (!place.formattedAddress) return true;
        const address = place.formattedAddress.toUpperCase();
        const stateCode = selectedState.toUpperCase();
        
        // Remove acentos da cidade selecionada e do endereço para comparar
        const normalize = (str: string) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const cityNormalized = normalize(selectedCity).toUpperCase();
        const addressNormalized = normalize(address);
        
        // Verifica Estado
        const hasState = address.includes(- \) || 
                         address.includes( \,) || 
                         address.includes(, \) ||
                         address.includes( \ ) ||
                         address.endsWith( \);
                         
        // Verifica Cidade (de forma menos rígida, apenas vendo se o nome da cidade tá no endereço)
        const hasCity = addressNormalized.includes(cityNormalized);
                         
        return hasState && hasCity;
      });
'''

# Find the block to replace
start_idx = content.find('// FILTRAGEM ESTRITA: Garante que o lead realmente pertence ao estado pesquisado')
end_idx = content.find('if (strictPlaces.length === 0) {')

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + replacement.strip() + '\n\n      ' + content[end_idx:]
    with codecs.open('src/pages/Scanner.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
else:
    print("Could not find the block to replace.")
