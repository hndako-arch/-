const fs = require('fs');

try {
    const html = fs.readFileSync('gu_utf8_353111.html', 'utf8');
    const match = html.match(/window\.__PRELOADED_STATE__\s*=\s*(.*?);\s*<\/script>/s);
    if (match) {
        fs.writeFileSync('gu_product_data.json', match[1], 'utf8');
        console.log('Successfully extracted JSON to gu_product_data.json');
    } else {
        console.error('Could not find window.__PRELOADED_STATE__');
    }
} catch (err) {
    console.error('Error:', err);
}
