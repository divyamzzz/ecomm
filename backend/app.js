const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 5000;

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36';

app.use(cors());

async function fetchAmazonData(productName) {
    try {
        const url = `https://www.amazon.in/s?k=${encodeURIComponent(productName)}&ref=nb_sb_noss_1`;
        const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);

        const products = [];
        $('div.s-result-item').each((index, element) => {
            if (products.length >= 2) return false;  // Limit to 2 products
            const titleElement = $(element).find('h2 a span');
            const priceElement = $(element).find('span.a-price-whole');
            const linkElement = $(element).find('h2 a');

            if (titleElement.length && priceElement.length && linkElement.length) {
                const title = titleElement.text().trim();
                const price = priceElement.text().trim().replace(',', '');
                const link = "https://www.amazon.in" + linkElement.attr('href');
                if (title && price && link) {
                    products.push({ title, price: parseFloat(price), link });
                }
            }
        });

        return products;
    } catch (error) {
        console.error('Error fetching Amazon data:', error);
        return [];
    }
}

async function fetchSnapdealData(productName) {
    try {
        const url = `https://www.snapdeal.com/search?keyword=${productName}&sort=rlvncy`;
        const response = await axios.get(url, { headers: { 'User-Agent': USER_AGENT } });
        const $ = cheerio.load(response.data);
        
        const products = [];
        $('div.product-tuple-listing').each((index, element) => {
            if (products.length >= 2) return false;  // Limit to 2 products
            const titleElement = $(element).find('p.product-title');
            const priceElement = $(element).find('span.lfloat.product-price');
            if (titleElement.length && priceElement.length) {
                const title = titleElement.text().trim();
                const price = priceElement.text().trim().replace('Rs. ', '').replace(',', '');
                const link = titleElement.parent().attr('href');
                if (title && price && link) {
                    products.push({ title, price: parseFloat(price), link });
                }
            }
        });
        
        return products;
    } catch (error) {
        console.error('Error fetching Snapdeal data:', error);
        return [];
    }
}

function comparePrices(amazonData, snapdealData) {
    const allProducts = [...amazonData, ...snapdealData];
    if (allProducts.length === 0) return null;

    let leastPriceProduct = allProducts[0];
    for (const product of allProducts) {
        if (product.price < leastPriceProduct.price) {
            leastPriceProduct = product;
        }
    }
    return leastPriceProduct;
}

app.get('/search', async (req, res) => {
    try {
        const productName = req.query.product || 'headphones';

        const [amazonData, snapdealData] = await Promise.all([
            fetchAmazonData(productName),
            fetchSnapdealData(productName)
        ]);

        const leastPriceProduct = comparePrices(amazonData, snapdealData);

        res.json({ amazonData, snapdealData, leastPriceProduct });
    } catch (error) {
        console.error('Error in /search route:', error);
        res.status(500).json({ error: 'An error occurred while fetching product data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
