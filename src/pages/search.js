import React, { useState } from 'react';
import axios from 'axios';

function Search() {
    const [productName, setProductName] = useState('');
    const [amazonData, setAmazonData] = useState([]);
    const [snapdealData, setSnapdealData] = useState([]);
    const [leastPriceProduct, setLeastPriceProduct] = useState(null);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:5000/search?product=${encodeURIComponent(productName)}`);
            setAmazonData(response.data.amazonData);
            setSnapdealData(response.data.snapdealData);
            setLeastPriceProduct(response.data.leastPriceProduct);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="App">
            <h1>Product Search</h1>
            <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
            />
            <button onClick={fetchData}>Search</button>

            {leastPriceProduct && (
                <div>
                    <h2>Cheapest Product</h2>
                    <div>
                        <strong>{leastPriceProduct.title}</strong> - {leastPriceProduct.price} -{' '}
                        <a href={leastPriceProduct.link} target="_blank" rel="noopener noreferrer">
                            View Product
                        </a>
                    </div>
                </div>
            )}

            <div>
                <h2>Amazon Products</h2>
                {amazonData.length > 0 ? (
                    <ul>
                        {amazonData.map((product, index) => (
                            <li key={index}>
                                <strong>{product.title}</strong> - {product.price} -{' '}
                                <a href={product.link} target="_blank" rel="noopener noreferrer">
                                    View Product
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No products found on Amazon.</p>
                )}
            </div>

            <div>
                <h2>Snapdeal Products</h2>
                {snapdealData.length > 0 ? (
                    <ul>
                        {snapdealData.map((product, index) => (
                            <li key={index}>
                                <strong>{product.title}</strong> - {product.price} -{' '}
                                <a href={product.link} target="_blank" rel="noopener noreferrer">
                                    View Product
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No products found on Snapdeal.</p>
                )}
            </div>
        </div>
    );
}

export default Search;
