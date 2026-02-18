const fs = require('fs');
const html = fs.readFileSync('gu_utf8_353111.html', 'utf8');

let pos = -1;
while ((pos = html.indexOf('"colors":[', pos + 1)) !== -1) {
    console.log('Index:', pos);
    console.log('Context:', html.substring(pos - 100, pos + 200).replace(/\n/g, ' '));
    console.log('-------------------');
}
