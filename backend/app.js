const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const pg= require('pg');
const helmet=require('helmet');
const env=require("dotenv")
const bcrypt=require("bcrypt")
const passport=require("passport")
const Strategy = require('passport-local').Strategy;
const session = require('express-session');
const PORT = 5000;
const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.45 Safari/537.36';
const app = express();
app.use(cors());
app.use(express.json());
app.use(helmet());
env.config();

app.use(session({
    secret:process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:true,
    cookie:{
      maxAge:1000*60*60*24,
    }
  })
  );
  
  app.use(passport.initialize());
  app.use(passport.session());
const saltRounds=10;
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
  db.connect()
    .then(() => console.log('Connected to the database'))
    .catch(err => console.error('Database connection error', err.stack));

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



app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error('Error during authentication', err.stack);
            return res.status(500).json({ message: 'Server Error' });
        }
        if (!user) {
            return res.status(401).json({ message: info.message });
        }

        req.login(user, (err) => {
            if (err) {
                console.error('Error during login', err.stack);
                return res.status(500).json({ message: 'Server Error' });
            }
            return res.status(200).json(user); 
        });
    })(req, res, next);
});
passport.use(new Strategy({
}, async (username, password, cb) => {
    try {
        const result = await db.query("SELECT * FROM login WHERE username = $1", [username]);
        if (result.rows.length > 0) {
            const user = result.rows[0];
            const storedPass = user.password;
            bcrypt.compare(password, storedPass, (err, isMatch) => {
                if (err) return cb(err);
                if (isMatch) {
                    return cb(null, user);
                } else {
                    return cb(null, false, { message: 'Incorrect password.' });
                }
            });
        } else {
            return cb(null, false, { message: 'User not registered.' });
        }
    } catch (err) {
        return cb(err);
    }
}));

  app.post('/signup', async (req, res) => {
    const { name,username, password } = req.body;
    try {
      // Check if the user already exists
      const checkUser = await db.query('SELECT * FROM login WHERE username = $1', [username]);
      if (checkUser.rows.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }
      else
      {
        bcrypt.hash(password, saltRounds,async(err,hash)=>{
            if(err)
                console.log(err);
            else{
                const result = await db.query('INSERT INTO login (Name, username, password) VALUES ($1, $2,$3) RETURNING *', [name,username, hash]);
                res.status(201).json(result.rows[0]);
            }
        })

    } 
  }
  catch (err) {
    console.error('Error executing query', err.stack);
    res.status(500).send('Server Error');
  }
});
passport.serializeUser((user,cb)=>{
    cb(null,user);
  })
  passport.deserializeUser((user,cb)=>{
    cb(null,user);
  })

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
