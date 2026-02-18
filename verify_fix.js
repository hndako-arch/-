const fs = require('fs');
const cheerio = require('cheerio');

const productId = '353111';
const brand = 'GU';
const html = fs.readFileSync('gu_utf8_353111.html', 'utf8');
const $ = cheerio.load(html);

let title = $('meta[property="og:title"]').attr('content') || $('title').text();
let category = '未分類';
let colors = [];

console.log('--- Debugging Scraper ---');

try {
    const searchKey = '"product":{"breadcrumbs":';
    let startIdx = html.indexOf(searchKey);

    if (startIdx !== -1) {
        console.log('Found product block start at', startIdx);
        let str = html.substring(startIdx + '"product":'.length);
        let braces = 0;
        let endIdx = -1;
        let inString = false;

        for (let i = 0; i < str.length; i++) {
            if (str[i] === '\\') { i++; continue; }
            if (str[i] === '"') inString = !inString;
            if (inString) continue;
            if (str[i] === '{') braces++;
            else if (str[i] === '}') {
                braces--;
                if (braces === 0) {
                    endIdx = i + 1;
                    break;
                }
            }
        }

        if (endIdx !== -1) {
            const productPart = str.substring(0, endIdx);
            console.log('Extracted product part length:', productPart.length);

            let stateObj;
            try {
                stateObj = JSON.parse(productPart);
                console.log('Successfully parsed product object.');
            } catch (e) {
                console.log('JSON Parse failed:', e.message);
            }

            // A helper to extract from string if object is missing
            const getColorsArr = () => {
                if (stateObj) {
                    return (stateObj.product?.colors || stateObj.colors);
                }
                const match = productPart.match(/"colors":\s*(\[.*?\])/);
                if (match) {
                    try { return JSON.parse(match[1]); } catch (err) {
                        // If JSON.parse fails, try a manual regex loop for each color object
                        console.log('Emergency regex for individual colors...');
                        const colorMatches = [...match[1].matchAll(/\{"code":"(.*?)"\s*,\s*"displayCode":"(.*?)"\s*,\s*"name":"(.*?)"/g)];
                        return colorMatches.map(m => ({ code: m[1], displayCode: m[2], name: m[3] }));
                    }
                }
                return null;
            };

            const getCategory = () => {
                if (stateObj) {
                    const b = stateObj.breadcrumbs;
                    const cat = b?.category?.locale || b?.category?.name;
                    const cls = b?.class?.locale || b?.class?.name;
                    if (cat && !['MEN', 'WOMEN', 'KIDS', 'BABY'].includes(cat)) return cat;
                    if (cls) return cls;
                }
                const catMatch = productPart.match(/"category":\{[^}]*?"locale":"(.*?)"/);
                if (catMatch) return catMatch[1];
                const clsMatch = productPart.match(/"class":\{[^}]*?"locale":"(.*?)"/);
                if (clsMatch) return clsMatch[1];
                return category;
            };

            category = getCategory();
            const colorsArr = getColorsArr();

            if (colorsArr) {
                console.log('Colors found, count:', colorsArr.length);
                const imageMap = (stateObj?.product?.images?.main || stateObj?.images?.main) || {};
                colorsArr.forEach(c => {
                    const code = c.displayCode || c.code;
                    const name = c.name;
                    let colorImg = imageMap[code]?.image;
                    if (!colorImg) {
                        colorImg = `https://image.uniqlo.com/GU/ST3/AsianCommon/imagesgoods/${productId}/item/goods_${code}_${productId}_3x4.jpg`;
                    }
                    if (!colors.some(col => col.code === code)) {
                        colors.push({ code, name, imageUrl: colorImg });
                    }
                });
            }
        }
    }
} catch (e) {
    console.error('Unexpected error:', e);
}

// category standardization
const catMap = {
    'トップス': 'トップス', 'アウター': 'アウター', 'ボトムス': 'ボトムス',
    'インナー': 'インナー', '下着': 'インナー', 'アクセサリー': '小物・その他',
    'グッズ': '小物・その他', 'バッグ': '小物・その他', 'シューズ': '小物・その他',
    'ルーム': 'ルームウェア', 'パジャマ': 'ルームウェア',
    'TOPS': 'トップス', 'BOTTOMS': 'ボトムス', 'OUTER': 'アウター',
    'JACKET': 'アウター', 'KNIT': 'トップス', 'SWEAT': 'トップス',
    'SHIRTS': 'トップス', 'PANTS': 'ボトムス'
};

for (const [key, val] of Object.entries(catMap)) {
    if (category.toUpperCase().includes(key)) {
        category = val;
        break;
    }
}

console.log('--- Scraped Results ---');
console.log('Title:', title);
console.log('Category:', category);
console.log('Colors Found:', colors.length);
colors.forEach(c => console.log(`- [${c.code}] ${c.name}: ${c.imageUrl}`));
