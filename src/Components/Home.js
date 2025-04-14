import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";
import Navbar from "./Navbar";
const Home = () => {
  return (
    
    <div>
      <Navbar />
    <div className="hero">
      <div className="content">
        <h1 className="headline">Invigilation Management System</h1>
        <p className="subheading">
          Manage your invigilation duties seamlessly with our platform.
        </p>

        <div className="cta-container">
          <Link to="/login" className="btn btn-primary">Login</Link>
          <Link to="/register" className="btn btn-secondary">Register</Link>
        </div>
      </div>
      {[...Array(6)].map((_, index) => (
        <div key={index} className={`cube cube-${index + 1}`}></div>
      ))}
    </div>
    </div>
  );
};

export default Home;