const fs = require('fs');

try {
    const data = JSON.parse(fs.readFileSync('gu_product_data.json', 'utf8'));

    // Search for product details
    // GU seems to store product data in state.product.product or similar
    const product = data.product?.product;
    if (product) {
        console.log('Product Name:', product.name);
        console.log('Product ID:', product.productId);

        if (product.colors) {
            console.log('Found color variations:');
            product.colors.forEach(c => {
                console.log(`- Code: ${c.colorCode}, Name: ${c.colorName}`);
                // Look for images
                const image = product.images?.find(img => img.colorCode === c.colorCode);
                console.log(`  Image: ${image?.url}`);
            });
        } else {
            console.log('No colors array found in product object.');
        }

        // Check for other potential locations
        console.log('Available keys in product object:', Object.keys(product));
    } else {
        console.log('Could not find product details in data.product.product');
        // Let's print the top level keys to find where it is
        console.log('Top level keys:', Object.keys(data));
        if (data.product) {
            console.log('Keys in data.product:', Object.keys(data.product));
        }
    }
} catch (err) {
    console.error('Error:', err);
}
