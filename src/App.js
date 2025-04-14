import React from "react";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from "./Components/Home";
import Login from "./Components/Login";
import Register from "./Components/Register";
import SwapRequestsPage from "./Components/SwapRequestsPage";
import PastExamsPage from "./Components/PastExamsPage";
import About from "./Components/About";
import Admindashboard from "./Components/Admindashboard";
import Facultydashboard from "./Components/FacultyDashboard";
import AdminPage from "./Components/AdminPage";
import "./App.css";
import Contact from "./Components/Contact";



  function App() {
    return (
      <BrowserRouter>
       
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admindashboard" element={<Admindashboard />} />
        <Route path="/adminPage" element={<AdminPage />} />
        <Route path="/facultydashboard" element={<Facultydashboard />} />
        <Route path="/home" element={<Home />} />
        <Route path="/logout" element={<Login />} />
        <Route path="/admin/swap-requests" element={<SwapRequestsPage />} />
        <Route path="/admin/past-exams" element={<PastExamsPage />} />
        <Route path="/contact" element={<Contact />} />
        </Routes>
        </BrowserRouter>
  );
};

export default App;