import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
function Signup(props) {
    const [user, setUser] = useState({
        name:"",
        username: "",
        password: ""
    });
    const navigate = useNavigate();
    function handleSubmit(event) {
        event.preventDefault();
        axios.post("http://localhost:5000/signup", user)
            .then(response => {
                if(response.data.id>=0)
                    navigate('/search');
            })
            .catch(error => {
                console.error("There was an error!", error);
                // Handle error
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
            <h1>WELCOME TO SIGNUP </h1>
        <form onSubmit={handleSubmit}>
        <h2>ENTER NAME</h2><input
                name="name"
                placeholder="Name"
                onChange={handleChange}
                value={user.name}
            />
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
        </form>
        </div>
    );
}

export default Signup;
