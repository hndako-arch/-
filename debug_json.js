const fs = require('fs');

try {
    const s = fs.readFileSync('gu_product_data.json', 'utf8');
    const pos = 1211;
    const start = Math.max(0, pos - 50);
    const end = Math.min(s.length, pos + 50);
    console.log('Context around position 1211:');
    console.log(s.substring(start, end));
    console.log('^'.padStart(pos - start + 1));
} catch (err) {
    console.error('Error:', err);
}
