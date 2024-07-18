import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Login() {
    const [user, setUser] = useState({
        username: "",
        password: ""
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        axios.post("http://localhost:5000/login", user)
            .then(response => {
                if (response.data.id > 0) {
                    // Save the email in localStorage (or any other state management)
                    localStorage.setItem('userEmail', response.data.username);
                    
                    navigate('/search');
                } else {
                    setError(response.data.message || 'Login failed. Try Again.');
                    setUser({
                        username: "",
                        password: ""
                    });
                }
            })
            .catch(err => {
                console.error('Login error:', err);
                setError(err.response?.data?.message || 'Login failed. Try Again.');
            });
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setUser(prevUser => ({
            ...prevUser,
            [name]: value
        }));
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Welcome to Login</h1>
            <form onSubmit={handleSubmit} style={{ display: 'inline-block', textAlign: 'left' }}>
                <div>
                    <label htmlFor="username">Enter Username</label>
                    <input
                        id="username"
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                        value={user.username}
                        required
                        style={{ display: 'block', marginBottom: '10px', padding: '10px', width: '300px' }}
                    />
                </div>
                <div>
                    <label htmlFor="password">Enter Password</label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        value={user.password}
                        required
                        style={{ display: 'block', marginBottom: '20px', padding: '10px', width: '300px' }}
                    />
                </div>
                <button type="submit" style={{ padding: '10px 20px', marginBottom: '20px' }}>Submit</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button style={{ padding: '10px 20px' }}>
                    <a 
                        className="btn btn-block"
                        href="http://localhost:5000/auth/google"
                        role="button"
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        Sign in with Google
                    </a>
                </button>
            </form>
        </div>
    );
}

export default Login;
