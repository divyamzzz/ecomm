// Filename - App.js

import React from "react";
import Navbar from "./components/Navbar";
import {
	BrowserRouter as Router,
	Routes,
	Route,
} from "react-router-dom";
import Home from "./pages";
import About from "./pages/about";
import Blogs from "./pages/blogs";
import Login from "./pages/login";
import Contact from "./pages/contact";
import Search from "./pages/search";
import Signup from "./pages/signup";
import SearchHistory from "./pages/SearchHistory"; // Corrected import

function App() {
	return (
		<Router>
			<Navbar />
			<Routes>
				<Route exact path="/" element={<Home />} />
				<Route path="/about" element={<About />} />
				<Route path="/contact" element={<Contact />} />
				<Route path="/blogs" element={<Blogs />} />
				<Route path="/login" element={<Login />} />
				<Route path="/signup" element={<Signup />} />
				<Route path="/search" element={<Search />} />
				<Route path="/history" element={<SearchHistory />} /> {/* Corrected the route definition */}
			</Routes>
		</Router>
	);
}

export default App;
