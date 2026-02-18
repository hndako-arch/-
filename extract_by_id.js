const fs = require('fs');
const s = fs.readFileSync('gu_product_data.json', 'utf8');
const id = '353111';
const searchStr = `"productId":"${id}"`;
const index = s.indexOf(searchStr);
console.log(`Index of ${searchStr}: ${index}`);

if (index !== -1) {
    // Find the start of the object containing this productId
    // We can look for the "product":{ that precedes it
    const productKey = '"product":{';
    const lastProductKey = s.lastIndexOf(productKey, index);
    if (lastProductKey !== -1) {
        console.log(`Found ${productKey} at ${lastProductKey}`);
        // Now find the matching closing brace
        let openBraces = 1;
        let i = lastProductKey + productKey.length;
        while (openBraces > 0 && i < s.length) {
            if (s[i] === '{') openBraces++;
            else if (s[i] === '}') openBraces--;
            i++;
        }
        const productJson = s.substring(lastProductKey + '"product":'.length, i);
        fs.writeFileSync('gu_extracted_product.json', productJson, 'utf8');
        console.log('Extracted product JSON to gu_extracted_product.json');
    }
}
