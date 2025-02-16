import React from "react";
import { Link } from "react-router-dom";
import logo from "./Vignan-University-Logo.jpg";
import "./Navbar.css";

function Navbar() {
  return (
    <div className="home-navbar">
      <nav className="navbar">
        <div className="logo">
          <img src={logo} alt="Logo" />
          <h2>Invigilation Management</h2>
        </div>
        <ul className="nav-links">
          <li><Link to="/">Home</Link></li>
          <li><Link to="/about">About</Link></li>
          <li><Link to="/contact">Contact</Link></li>
          <li><Link to="/login" className="btn-nav">Login</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default Navbar;
