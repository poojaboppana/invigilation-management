import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminPage.css";

const AdminPage = () => {
    const navigate = useNavigate();
    const [swapRequests, setSwapRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSwapRequests = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/swap-requests");
                setSwapRequests(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching swap requests:", error);
                setLoading(false);
            }
        };
        fetchSwapRequests();
    }, []);

    const handleCreateExam = () => {
        navigate("/admindashboard");
    };

    const handleViewPastExams = () => {
        navigate("/admin/past-exams");
    };

    const handleProcessSwapRequest = async (requestId, action) => {
        try {
            await axios.put(`http://localhost:5000/api/swap-requests/${requestId}`, { action });
            setSwapRequests(swapRequests.filter(req => req._id !== requestId));
            alert(`Swap request ${action}d successfully`);
        } catch (error) {
            alert(`Failed to ${action} swap request: ${error.response?.data?.message || error.message}`);
        }
    };

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <h2>Invigilation Admin</h2>
                <ul>
                    <li><a href="/home">Home</a></li>
                    <li><a href="#create-exam" onClick={handleCreateExam}>Create Exam & Assign Invigilators</a></li>
                    <li>
                        <a href="#past-exams" onClick={handleViewPastExams}>
                            View Past Exams
                        </a>
                    </li>
                    <li><a href="/logout">Logout</a></li>
                </ul>
            </aside>
            <main className="main-content">
                <header>
                    <h1>Admin Dashboard</h1>
                </header>
                <section id="create-exam" className="card">
                    <h2>Create Exam & Assign Invigilators</h2>
                    <button className="btn" onClick={handleCreateExam}>Create New Exam</button>
                </section>
                <section id="swap-requests" className="card">
                    <h2>Pending Swap Requests</h2>
                    {loading ? (
                        <p>Loading swap requests...</p>
                    ) : swapRequests.length > 0 ? (
                        <div className="swap-requests-list">
                            {swapRequests.map(request => (
                                <div key={request._id} className="swap-request-item">
                                    <div className="request-details">
                                        <p><strong>From:</strong> {request.requestingFaculty.name} ({request.requestingFaculty.department})</p>
                                        <p><strong>To:</strong> {request.requestedFaculty?.name || "Faculty"} ({request.requestedFaculty?.department || "Department"})</p>
                                        <p><strong>Exam:</strong> {request.examId?.examName || "Exam"}</p>
                                        <p><strong>Date:</strong> {new Date(request.invigilationId?.date).toLocaleDateString()}</p>
                                        <p><strong>Time:</strong> {request.invigilationId?.startTime} - {request.invigilationId?.endTime}</p>
                                        <p><strong>Reason:</strong> {request.reason}</p>
                                    </div>
                                    <div className="request-actions">
                                        <button 
                                            className="approve-btn"
                                            onClick={() => handleProcessSwapRequest(request._id, "approve")}
                                        >
                                            Approve
                                        </button>
                                        <button 
                                            className="reject-btn"
                                            onClick={() => handleProcessSwapRequest(request._id, "reject")}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No pending swap requests</p>
                    )}
                </section>
                <section id="past-exams" className="card">
                    <h2>View Past Exams</h2>
                    <button className="btn" onClick={handleViewPastExams}>View Past Exams</button>
                </section>
            </main>
        </div>
    );
};

export default AdminPage;