import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./Register.css"; // Link to the CSS file
import professor from "./professor2.png";
import Navbar from "./Navbar";
const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5000/register", {
        username,
        password,
        confirmPassword,
      });
      alert(response.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  return (
    <div>
    <Navbar />
    <div className="register-container">
       <div>
                <img src={professor} alt="professor" className="professor" />
              </div>
      <div className="register-box">
        <h2 className="register-title">SIGN UP</h2>
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
   
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="register-btn">REGISTER</button>
        </form>
        <p className="existing-account">
          Already have an account?{" "}
          <a href="/login" className="login-link">
            Login here
          </a>
        </p>
      </div>
    </div>
    </div>
  );
};

export default Register;
