import React, { useState, useEffect } from "react";
import axios from "axios";

import "./AdminPage.css";

const SwapRequestsPage = () => {
  
    const [swapRequests, setSwapRequests] = useState([]);

    const fetchSwapRequests = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/swap-requests");
            setSwapRequests(response.data);
        } catch (error) {
            console.error("Error fetching swap requests:", error);
            setSwapRequests([]);
        }
    };

    const handleSwapAction = async (requestId, action) => {
        try {
            const response = await axios.put(
                `http://localhost:5000/api/swap-requests/${requestId}`, 
                { action }
            );
        
            if (response.status === 200) {
                setSwapRequests(prevRequests => 
                    prevRequests.filter(request => request._id !== requestId)
                );
                alert(`Swap request ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
            }
        } catch (error) {
            console.error("Error processing swap request:", error);
            alert(error.response?.data?.message || "Failed to process swap request");
        }
    };

    useEffect(() => {
        fetchSwapRequests();
    }, []);

    return (
        <div className="dashboard">
            <aside className="sidebar">
                <h2>Invigilation Admin</h2>
                <ul>
                    <li><a href="/home">Home</a></li>
                    <li><a href="/admindashboard">Create Exam & Assign Invigilators</a></li>
                    <li><a href="/admin/swap-requests" className="active">View Swap Requests</a></li>
                    <li><a href="/admin/past-exams">View Past Exams</a></li>
                    <li><a href="/logout">Logout</a></li>
                </ul>
            </aside>
            <main className="main-content">
                <header>
                    <h1>Swap Requests</h1>
                </header>
                <section className="card">
                    {swapRequests.length > 0 ? (
                        <div className="requests-list">
                            {swapRequests.map(request => (
                                <div key={request._id} className="request-item">
                                    <div className="request-details">
                                        <p>
                                            <strong>{request.requestingFaculty?.name || "Unknown Faculty"}</strong> 
                                            requested a swap for exam: {request.examId?.examName || "Unknown Exam"}
                                        </p>
                                        <p>Reason: {request.reason}</p>
                                        <p>Status: {request.status}</p>
                                        <p>Created: {new Date(request.createdAt).toLocaleString()}</p>
                                    </div>
                                    {request.status === 'pending' && (
                                        <div className="request-actions">
                                            <button 
                                                className="approve-btn"
                                                onClick={() => handleSwapAction(request._id, 'approve')}
                                            >
                                                Approve
                                            </button>
                                            <button 
                                                className="reject-btn"
                                                onClick={() => handleSwapAction(request._id, 'reject')}
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>No swap requests found.</p>
                    )}
                </section>
            </main>
        </div>
    );
};

export default SwapRequestsPage;