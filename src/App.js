import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./Components/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Navbar from "./Components/Navbar";
import About from "./Components/About";
import Admindashboard from "./Components/Admindashboard";
import Facultydashboard from "./Components/Facultydashboard";
import "./App.css";


  function App() {
    return (
      <BrowserRouter>
        <Navbar />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admindashboard" element={<Admindashboard />} />
        <Route path="/facultydashboard" element={<Facultydashboard />} />
        </Routes>
        </BrowserRouter>
  );
};

export default App;