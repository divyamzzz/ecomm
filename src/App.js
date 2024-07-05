import React, { useState } from 'react';
import axios from 'axios';

function App() {
    const [productName, setProductName] = useState('headphones');
    const [amazonData, setAmazonData] = useState([]);
    const [flipkartData, setFlipkartData] = useState([]);

    const fetchData = async () => {
        try {
            const response = await axios.get(`http://localhost:3000/search?product=${encodeURIComponent(productName)}`);
            setAmazonData(response.data.amazonData);
            setFlipkartData(response.data.flipkartData);
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
                <h2>Flipkart Products</h2>
                {flipkartData.length > 0 ? (
                    <ul>
                        {flipkartData.map((product, index) => (
                            <li key={index}>
                                <strong>{product.title}</strong> - {product.price} -{' '}
                                <a href={product.link} target="_blank" rel="noopener noreferrer">
                                    View Product
                                </a>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No products found on Flipkart.</p>
                )}
            </div>
        </div>
    );
}

export default App;
