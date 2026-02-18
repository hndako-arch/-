import { NextResponse } from 'next/server';
import { load } from 'cheerio';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const brand = searchParams.get('brand'); // 'UNIQLO' or 'GU'
    const productId = searchParams.get('productId');

    if (!brand || !productId) {
        return NextResponse.json({ error: 'Missing brand or productId' }, { status: 400 });
    }

    let url = '';
    if (brand === 'UNIQLO') {
        url = `https://www.uniqlo.com/jp/ja/products/${productId}`;
    } else if (brand === 'GU') {
        url = `https://www.gu-global.com/jp/ja/products/${productId}`;
    } else {
        return NextResponse.json({ error: 'Invalid brand' }, { status: 400 });
    }

    const colors: { code: string; name: string; imageUrl?: string }[] = [];
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    };

    try {
        // 1. Attempt to fetch via UNIQLO/GU Commerce API
        const apiHost = brand === 'UNIQLO' ? 'www.uniqlo.com' : 'www.gu-global.com';
        try {
            const idsToTry = brand === 'UNIQLO' ? [productId, `E${productId}-000`] : [productId];
            for (const id of idsToTry) {
                const apiRes = await fetch(`https://${apiHost}/jp/api/commerce/v1/ja/products/${id}`, { headers });
                if (apiRes.ok) {
                    const apiData = await apiRes.json();
                    const variations = apiData.result?.product?.variations || apiData.result?.variations;
                    if (variations && Array.isArray(variations)) {
                        variations.forEach((v: any) => {
                            if (v.color?.code && v.color?.name) {
                                const code = v.color.code;
                                const name = v.color.name;
                                let colorImageUrl = brand === 'UNIQLO'
                                    ? `https://image.uniqlo.com/UQ/ST3/jp/imagesgoods/${productId}/item/jpgoods_${code}_${productId}_3x4.jpg`
                                    : `https://image.gu-global.com/ug/img/res/goods/${productId}/item/jpgoods_${code}_${productId}.jpg`;

                                if (!colors.some(c => c.code === code)) {
                                    colors.push({ code, name, imageUrl: colorImageUrl });
                                }
                            }
                        });
                    }
                }
                if (colors.length > 0) break;
            }
        } catch (e) {
            console.error(`${brand} API Error:`, e);
        }

        // 2. Fetch HTML for metadata and category
        let response = await fetch(url, { headers, redirect: 'follow' });
        let html = await response.text();

        if (brand === 'UNIQLO' && (html.includes('Redirecting to') || html.length < 1000)) {
            const redirectUrl = `https://www.uniqlo.com/jp/ja/products/E${productId}-000/00`;
            const retryResponse = await fetch(redirectUrl, { headers });
            if (retryResponse.ok) {
                response = retryResponse;
                html = await retryResponse.text();
            }
        }

        if (!response.ok) {
            return NextResponse.json({ error: 'Failed to fetch product page' }, { status: response.status });
        }

        const $ = load(html);
        let title = $('meta[property="og:title"]').attr('content') || $('title').text();
        let imageUrl = $('meta[property="og:image"]').attr('content');
        let category = '未分類';

        // 3. Extract data from window.__PRELOADED_STATE__
        try {
            // Updated extraction logic for robustness against corrupted JSON/encoding issues
            const searchKey = '"product":{"breadcrumbs":';
            let startIdx = html.indexOf(searchKey);

            if (startIdx !== -1) {
                console.log('Found product block in state at', startIdx);
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
                    let stateObj: any = null;
                    try {
                        stateObj = JSON.parse(productPart);
                    } catch (e) {
                        console.log('JSON Parse failed for GU product block, using emergency fallbacks.');
                    }

                    // Extract Category (State or Emergency String Match)
                    const getCategoryFromBlock = () => {
                        if (stateObj) {
                            const b = stateObj.breadcrumbs;
                            const cat = b?.category?.locale || b?.category?.name;
                            const cls = b?.class?.locale || b?.class?.name;
                            if (cat && !['MEN', 'WOMEN', 'KIDS', 'BABY'].includes(cat.toUpperCase())) return cat;
                            if (cls) return cls;
                        }
                        const catMatch = productPart.match(/"category":\{[^}]*?"locale":"(.*?)"/);
                        if (catMatch) return catMatch[1];
                        const clsMatch = productPart.match(/"class":\{[^}]*?"locale":"(.*?)"/);
                        if (clsMatch) return clsMatch[1];
                        return null;
                    };

                    const blockCategory = getCategoryFromBlock();
                    if (blockCategory) category = blockCategory;

                    // Extract Colors (State or Emergency String Match)
                    const getColorsFromBlock = () => {
                        if (stateObj) {
                            return (stateObj.product?.colors || stateObj.colors);
                        }
                        const match = productPart.match(/"colors":\s*(\[.*?\])/);
                        if (match) {
                            try { return JSON.parse(match[1]); } catch (err) {
                                // Deep emergency: individual color objects via regex
                                const colorMatches = Array.from(match[1].matchAll(/\{"code":"(.*?)"\s*,\s*"displayCode":"(.*?)"\s*,\s*"name":"(.*?)"/g));
                                return colorMatches.map(m => ({ code: m[1], displayCode: m[2], name: m[3] }));
                            }
                        }
                        return null;
                    };

                    const colorsArr = getColorsFromBlock();
                    if (colorsArr && Array.isArray(colorsArr)) {
                        const imageMap = (stateObj?.product?.images?.main || stateObj?.images?.main) || {};
                        colorsArr.forEach((c: any) => {
                            const code = c.displayCode || c.code;
                            const name = c.name;
                            let colorImg = imageMap[code]?.image;

                            if (!colorImg) {
                                colorImg = brand === 'UNIQLO'
                                    ? `https://image.uniqlo.com/UQ/ST3/jp/imagesgoods/${productId}/item/jpgoods_${code}_${productId}_3x4.jpg`
                                    : `https://image.uniqlo.com/GU/ST3/AsianCommon/imagesgoods/${productId}/item/goods_${code}_${productId}_3x4.jpg`;
                            }

                            if (!colors.some(col => col.code === code)) {
                                colors.push({ code, name, imageUrl: colorImg });
                            }
                        });
                    }
                }
            }
        } catch (e) {
            console.error('Error parsing preloaded state:', e);
        }

        // 4. Fallback: Parse breadcrumbs from HTML
        if (category === '未分類') {
            const breadcrumbItems: string[] = [];
            $('.breadcrumb li, .fr-breadcrumb-item, [class*="breadcrumbs"] li').each((_, el) => {
                const text = $(el).text().trim();
                if (text && text !== '/' && text !== '>') breadcrumbItems.push(text);
            });

            if (breadcrumbItems.length >= 2) {
                category = breadcrumbItems[1];
            } else {
                const catMatch = html.match(/"categoryName"\s*:\s*"([^"]+)"/i) ||
                    html.match(/"classLName"\s*:\s*"([^"]+)"/i);
                if (catMatch) category = catMatch[1];
            }
        }

        // Standardize category
        const catMap: { [key: string]: string } = {
            'トップス': 'トップス',
            'アウター': 'アウター',
            'ボトムス': 'ボトムス',
            'インナー': 'インナー',
            '下着': 'インナー',
            'アクセサリー': '小物・その他',
            'グッズ': '小物・その他',
            'バッグ': '小物・その他',
            'シューズ': '小物・その他',
            'ルーム': 'ルームウェア',
            'パジャマ': 'ルームウェア',
            'TOPS': 'トップス',
            'BOTTOMS': 'ボトムス',
            'OUTER': 'アウター',
            'JACKET': 'アウター',
            'KNIT': 'トップス',
            'SWEAT': 'トップス',
            'SHIRTS': 'トップス',
            'PANTS': 'ボトムス'
        };

        for (const [key, val] of Object.entries(catMap)) {
            if (category.toUpperCase().includes(key)) {
                category = val;
                break;
            }
        }

        if (category === 'MEN' || category === 'WOMEN' || category === 'KIDS' || category === 'BABY') {
            category = '未分類';
        }

        // 5. Fallback: Parse script tags for colors using more flexible regex
        if (colors.length === 0) {
            $('script').each((_, el) => {
                const content = $(el).html();
                if (!content) return;
                // Match both digit codes and alphanumeric codes
                const regex = /"code"\s*:\s*"([^"]+)"[^}]*"name"\s*:\s*"([^"]+)"/g;
                let match;
                while ((match = regex.exec(content)) !== null) {
                    let code = match[1];
                    const name = match[2];
                    // Clean code (extract last 2 digits if it's alphanumeric like GCL62)
                    const codeMatch = code.match(/(\d{2})$/);
                    if (codeMatch) code = codeMatch[1];

                    if (code && name && !colors.some(c => c.code === code)) {
                        let colorImageUrl = brand === 'UNIQLO'
                            ? `https://image.uniqlo.com/UQ/ST3/jp/imagesgoods/${productId}/item/jpgoods_${code}_${productId}_3x4.jpg`
                            : `https://image.uniqlo.com/GU/ST3/AsianCommon/imagesgoods/${productId}/item/goods_${code}_${productId}_3x4.jpg`;
                        if (name.length < 50) colors.push({ code, name, imageUrl: colorImageUrl });
                    }
                }
            });
        }

        const uniqueColors = Array.from(new Map(colors.map(c => [c.code, c])).values());
        if (title) title = title.replace(/ \| UNIQLO.*/, '').replace(/ \| GU.*/, '');

        return NextResponse.json({
            success: true,
            data: {
                title,
                imageUrl,
                url,
                productId,
                brand,
                category,
                colors: uniqueColors
            }
        });

    } catch (error) {
        console.error('Scraping error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
