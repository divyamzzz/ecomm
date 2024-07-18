// Filename - SearchHistory.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function SearchHistory() {
    const [history, setHistory] = useState([]);
    const userEmail = localStorage.getItem('userEmail'); // Use the stored email

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/searchHistory?email=${userEmail}`);
                setHistory(response.data);
            } catch (error) {
                console.error('Error fetching search history:', error);
            }
        };

        fetchHistory();
    }, [userEmail]);

    return (
        <div className="App">
            <h1>Search History</h1>
            {history.length > 0 ? (
                <ul>
                    {history.map((item, index) => (
                        <li key={index}>
                            <strong>{item.product_name}</strong> - {new Date(item.search_date).toLocaleString()}
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No search history found.</p>
            )}
        </div>
    );
}

export default SearchHistory;
