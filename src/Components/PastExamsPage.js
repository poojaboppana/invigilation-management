import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./AdminPage.css";

const PastExamsPage = () => {
    const navigate = useNavigate();
    const [pastExams, setPastExams] = useState([]);

    const fetchPastExams = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/exams/completed");
            setPastExams(response.data);
        } catch (error) {
            console.error("Error fetching past exams:", error);
            setPastExams([]);
        }
    };

    useEffect(() => {
        fetchPastExams();
    }, []);

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <h2>Invigilation Admin</h2>
                <ul>
                    <li><a href="/home">Home</a></li>
                    <li><a href="/admindashboard">Create Exam & Assign Invigilators</a></li>
                    <li><a href="/admin/swap-requests">View Swap Requests</a></li>
                    <li><a href="/admin/past-exams" className="active">View Past Exams</a></li>
                    <li><a href="/logout">Logout</a></li>
                </ul>
            </aside>
            <main className="main-content">
                <header>
                    <h1>Past Exams</h1>
                </header>
                <section className="card">
                    {pastExams.length > 0 ? (
                        <div className="exams-list">
                            {pastExams.map(exam => (
                                <div key={exam._id} className="exam-item">
                                    <h3>{exam.examName}</h3>
                                    <p>Date: {new Date(exam.slots[0].date).toLocaleDateString()}</p>
                                    <p>Total Slots: {exam.slots.length}</p>
                                    <button 
                                        className="view-details-btn"
                                        onClick={() => navigate(`/exam-details/${exam._id}`)}
                                    >
                                        View Details
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No past exams found.</p>
                    )}
                </section>
            </main>
        </div>
    );  
};

export default PastExamsPage;