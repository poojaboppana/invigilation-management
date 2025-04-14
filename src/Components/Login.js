import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import professor from "./professor2.png";
import "./Login.css";
import Navbar from "./Navbar";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("faculty"); // Default role is faculty
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        username,
        password,
        role, // Sending the role along with credentials
      });

      alert(response.data.message);

      // Store faculty username in localStorage if faculty login is successful
      if (role === "faculty" && response.data.facultyUsername) {
        localStorage.setItem("facultyUsername", response.data.facultyUsername);
      }

      // Navigate based on role
      if (role === "admin") {
        navigate("/adminPage");
      } else if (role === "faculty") {
        navigate("/facultydashboard");
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        alert(err.response.data.message);
      } else {
        alert("An error occurred. Please try again later.");
      }
    }
  };

  return (
    <div> 
      <Navbar />
      <div className="login-container">
        <div className="login-box">
          <h2 className="login-title">SIGN IN</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
             
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
             
              <select value={role} onChange={(e) => setRole(e.target.value)} required>
                <option value="faculty">Faculty</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button type="submit" className="login-btn">LOGIN</button>
          </form>
          <p>
            Don't have an account?{" "}
            <a href="/register" className="register-link">
              Register here
            </a>
          </p>
        </div>
        <div>
          <img src={professor} alt="professor" className="professor" />
        </div>
      </div>
    </div>
  );
};

export default Login;
