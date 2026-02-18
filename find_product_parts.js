const fs = require('fs');

try {
    const s = fs.readFileSync('gu_product_data.json', 'utf8');

    // Search for all occurrences of "product":{
    let pos = 0;
    while ((pos = s.indexOf('"product":{', pos)) !== -1) {
        console.log(`Found "product":{ at index ${pos}`);

        // Try to extract this object
        let openBraces = 1;
        let i = pos + '"product":{'.byteLength - 1; // Wait, strings are UTF-16 in JS, but let's just use .length
        i = pos + '"product":{'.length;

        while (openBraces > 0 && i < s.length) {
            if (s[i] === '{') openBraces++;
            else if (s[i] === '}') openBraces--;
            i++;
        }

        const objStr = s.substring(pos + '"product":'.length, i);
        console.log(`Extracted object of length ${objStr.length}`);

        // Peek at the beginning of the object
        console.log(`Peek: ${objStr.substring(0, 200)}...`);

        // If it looks like the right one (contains colors), save it
        if (objStr.includes('"colors"')) {
            console.log('This object contains "colors"! Saving to gu_product_part.json');
            fs.writeFileSync('gu_product_part.json', objStr, 'utf8');
        }

        pos = i;
    }
} catch (err) {
    console.error('Error:', err);
}
