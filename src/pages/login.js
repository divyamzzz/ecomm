import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

function Login(props) {
    const [user, setUser] = useState({
        username: "",
        password: ""
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    function handleSubmit(event) {
        event.preventDefault();
        axios.post("http://localhost:5000/login",user)
            .then(response => {
                console.log(user);
                if(response.data.id>0)
                    navigate('/search');
                else
                {
                    setError(error.response?.data?.message || 'Login failed Try Again');
                    setUser(
                    {
                        username:"",
                        password:""
                    }
                )
            }
            })
            .catch(error => {
                console.error('Login error:', error);
            });
    }

    function handleChange(event) {
        const { name, value } = event.target;
        setUser(prevUser => ({
            ...prevUser,
            [name]: value
        }));
    }

    return (
        <div>
        <h1>WELCOME TO LOGIN </h1>
    <form onSubmit={handleSubmit}>
        <h2>ENTER USERNAME</h2><input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            value={user.username}
        />
        <h2>ENTER PASSWORD</h2>
        <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={user.password}
        />
        <br/>
        <br/>
        <button type="submit">Submit</button>
        {error && <p>{error}</p>}
    </form>
    </div>
    );
}

export default Login;
