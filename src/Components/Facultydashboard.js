import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import "./FacultyDashboard.css";

const FacultyDashboard = () => {
    const [faculty, setFaculty] = useState(null);
    const [invigilations, setInvigilations] = useState([]);
    const [pastInvigilations, setPastInvigilations] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showSwapModal, setShowSwapModal] = useState(false);
    const [currentInvigilation, setCurrentInvigilation] = useState(null);
    const [swapReason, setSwapReason] = useState("");
    const [facultyList, setFacultyList] = useState([]);
    const [selectedFacultyToSwapWith, setSelectedFacultyToSwapWith] = useState("");

    const username = localStorage.getItem("facultyUsername");

    const timeToMinutes = (time) => {
        if (!time) return 0;
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const fetchFacultyData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`http://localhost:5000/api/faculty/dashboard/${username}`);
            if (!response.data) {
                throw new Error("No data received from server");
            }

            setFaculty(response.data.faculty || null);
            setNotifications(response.data.notifications || []);

            const now = new Date();

            // Filter invigilations
            const upcoming = (response.data.invigilations || []).filter(inv => {
                const invDate = new Date(inv.date);
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                if (invDate > today) return true;
                if (invDate.toDateString() === today.toDateString()) {
                    const endTimeMinutes = timeToMinutes(inv.endTime);
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    return endTimeMinutes > currentMinutes;
                }
                return false;
            });

            const past = (response.data.invigilations || []).filter(inv => {
                const invDate = new Date(inv.date);
                const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                
                if (invDate < today) return true;
                if (invDate.toDateString() === today.toDateString()) {
                    const endTimeMinutes = timeToMinutes(inv.endTime);
                    const currentMinutes = now.getHours() * 60 + now.getMinutes();
                    return endTimeMinutes <= currentMinutes;
                }
                return false;
            });

            setInvigilations(upcoming);
            setPastInvigilations(past);

        } catch (error) {
            console.error("Fetch faculty data error:", error);
            setError(error.response?.data?.message || "Failed to load dashboard. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [username]);

    const fetchFacultyList = useCallback(async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/faculty");
            setFacultyList(response.data.filter(f => f.username !== username));
        } catch (error) {
            console.error("Error fetching faculty list:", error);
        }
    }, [username]);

    useEffect(() => {
        if (!username) {
            setError("No faculty username found. Please log in.");
            setLoading(false);
            return;
        }
        fetchFacultyData();
        fetchFacultyList();

        // Poll for updates every 30 seconds
        const interval = setInterval(fetchFacultyData, 30000);
        return () => clearInterval(interval);
    }, [username, fetchFacultyData, fetchFacultyList]);

    const handleLogout = () => {
        localStorage.removeItem("facultyUsername");
        window.location.href = "/login";
    };

    const handleConfirmInvigilation = async (invigilationId) => {
        try {
            await axios.put(`http://localhost:5000/api/invigilations/${invigilationId}/confirm`);
            await fetchFacultyData();
            alert("Invigilation confirmed successfully!");
        } catch (error) {
            console.error("Confirm invigilation error:", error);
            alert(error.response?.data?.message || "Failed to confirm invigilation");
        }
    };

    const handleSwapRequest = (invigilation) => {
        setCurrentInvigilation(invigilation);
        setShowSwapModal(true);
    };

    const handleSwapSubmit = async () => {
        if (!swapReason.trim()) {
            alert("Please provide a reason for the swap");
            return;
        }

        if (!selectedFacultyToSwapWith) {
            alert("Please select a faculty member to swap with");
            return;
        }

        try {
            await axios.post("http://localhost:5000/api/swap-requests", {
                invigilationId: currentInvigilation._id,
                requestingUsername: username,
                requestedUsername: selectedFacultyToSwapWith,
                reason: swapReason
            });
            setShowSwapModal(false);
            setSwapReason("");
            setSelectedFacultyToSwapWith("");
            await fetchFacultyData();
            alert("Swap request submitted successfully!");
        } catch (error) {
            console.error("Swap request error:", error);
            alert(error.response?.data?.message || "Failed to submit swap request");
        }
    };

    const formatDate = (dateString) => {
        try {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        } catch (e) {
            return dateString;
        }
    };

    const renderDashboardContent = () => (
        <div className="dashboard-content">
            <div className="welcome-section">
                <h2>Welcome, {faculty?.name}</h2>
                {faculty?.department && <p className="department">Department of {faculty.department}</p>}
            </div>

            <div className="summary-cards">
                <div className="summary-card upcoming-invigilations">
                    <h3>Upcoming Invigilations</h3>
                    {invigilations.length > 0 ? (
                        <>
                            <ul className="invigilation-list">
                                {invigilations.slice(0, 3).map(inv => (
                                    <li key={inv._id} className="invigilation-item">
                                        <div className="exam-name">{inv.examName}</div>
                                        <div className="exam-details">
                                            <span>{formatDate(inv.date)}</span>
                                            <span>{inv.startTime} - {inv.endTime}</span>
                                            <span>{inv.venue}</span>
                                            <span>Status: {inv.status}</span>
                                        </div>
                                        {inv.status === "Assigned" && (
                                            <div className="invigilation-actions">
                                                <button 
                                                    className="confirm-btn"
                                                    onClick={() => handleConfirmInvigilation(inv._id)}
                                                >
                                                    Confirm
                                                </button>
                                                <button 
                                                    className="swap-btn"
                                                    onClick={() => handleSwapRequest(inv)}
                                                >
                                                    Request Swap
                                                </button>
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            {invigilations.length > 3 && (
                                <button 
                                    className="view-all-btn"
                                    onClick={() => setActiveTab("invigilations")}
                                >
                                    View All ({invigilations.length})
                                </button>
                            )}
                        </>
                    ) : (
                        <p className="no-data">No upcoming invigilations</p>
                    )}
                </div>
            </div>

            <div className="notifications-section">
                <h3>Notifications</h3>
                {notifications.length > 0 ? (
                    <ul className="notification-list">
                        {notifications.map((notif) => (
                            <li key={notif._id} className={`notification-item ${notif.status === "Unread" ? "unread" : ""}`}>
                                <div className="notification-message">{notif.message}</div>
                                <div className="notification-date">
                                    {new Date(notif.createdAt).toLocaleString()}
                                </div>
                                {notif.status === "Unread" && (
                                    <button
                                        className="mark-read-btn"
                                        onClick={async () => {
                                            try {
                                                await axios.put(`http://localhost:5000/api/notifications/${notif._id}/read`);
                                                await fetchFacultyData();
                                            } catch (error) {
                                                console.error("Mark notification read error:", error);
                                            }
                                        }}
                                    >
                                        Mark as Read
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="no-data">No notifications</p>
                )}
            </div>
        </div>
    );

    const renderInvigilationsContent = () => (
        <div className="invigilations-content">
            <h2>Current Invigilations</h2>
            {invigilations.length > 0 ? (
                <div className="invigilation-grid">
                    {invigilations.map(inv => (
                        <div key={inv._id} className="invigilation-card">
                            <h3>{inv.examName}</h3>
                            <div className="invigilation-details">
                                <p><strong>Date:</strong> {formatDate(inv.date)}</p>
                                <p><strong>Time:</strong> {inv.startTime} - {inv.endTime}</p>
                                <p><strong>Venue:</strong> {inv.venue}</p>
                                <p><strong>Status:</strong> <span className={`status-${inv.status.toLowerCase()}`}>{inv.status}</span></p>
                                <p><strong>Exam Type:</strong> {inv.examType}</p>
                            </div>
                            {inv.status === "Assigned" && (
                                <div className="invigilation-actions">
                                    <button 
                                        className="confirm-btn"
                                        onClick={() => handleConfirmInvigilation(inv._id)}
                                    >
                                        Confirm
                                    </button>
                                    <button 
                                        className="swap-btn"
                                        onClick={() => handleSwapRequest(inv)}
                                    >
                                        Request Swap
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-data">No current invigilations assigned</p>
            )}
        </div>
    );

    const renderPastInvigilationsContent = () => (
        <div className="past-invigilations-content">
            <h2>Past Invigilations</h2>
            {pastInvigilations.length > 0 ? (
                <div className="invigilation-grid">
                    {pastInvigilations.map(inv => (
                        <div key={inv._id} className="invigilation-card">
                            <h3>{inv.examName}</h3>
                            <div className="invigilation-details">
                                <p><strong>Date:</strong> {formatDate(inv.date)}</p>
                                <p><strong>Time:</strong> {inv.startTime} - {inv.endTime}</p>
                                <p><strong>Venue:</strong> {inv.venue}</p>
                                <p><strong>Status:</strong> <span className={`status-${inv.status.toLowerCase()}`}>{inv.status}</span></p>
                                <p><strong>Exam Type:</strong> {inv.examType}</p>
                            </div>
                            <div className="invigilation-actions">
                                <button 
                                    className="details-btn"
                                    onClick={async () => {
                                        try {
                                            const response = await axios.get(`http://localhost:5000/api/faculty/invigilation-details/${inv._id}`);
                                            alert(
                                                `Exam: ${response.data.examName}\n` +
                                                `Type: ${response.data.examType}\n` +
                                                `Date: ${formatDate(response.data.date)}\n` +
                                                `Time: ${response.data.startTime} - ${response.data.endTime}\n` +
                                                `Venue: ${response.data.venue}\n` +
                                                `Status: ${response.data.status}`
                                            );
                                        } catch (error) {
                                            console.error("Error fetching invigilation details:", error);
                                            alert("Failed to load invigilation details");
                                        }
                                    }}
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="no-data">No past invigilations found</p>
            )}
        </div>
    );

    const renderContent = () => {
        if (loading) return <div className="loading-message">Loading dashboard...</div>;
        if (error) return <div className="error-message">{error}</div>;

        switch (activeTab) {
            case "dashboard":
                return renderDashboardContent();
            case "invigilations":
                return renderInvigilationsContent();
            case "past-invigilations":
                return renderPastInvigilationsContent();
            default:
                return null;
        }
    };

    return (
        <div className="faculty-dashboard-container">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h2>Faculty Portal</h2>
                    <div className="faculty-info">
                        <p>{faculty?.name}</p>
                        {faculty?.department && <p>{faculty.department}</p>}
                    </div>
                </div>
                <ul className="sidebar-menu">
                    <li className={activeTab === "dashboard" ? "active" : ""}>
                        <button onClick={() => setActiveTab("dashboard")}>
                            <i className="fas fa-home"></i> Dashboard
                        </button>
                    </li>
                    <li className={activeTab === "invigilations" ? "active" : ""}>
                        <button onClick={() => setActiveTab("invigilations")}>
                            <i className="fas fa-clipboard-list"></i> Current Invigilations
                        </button>
                    </li>
                    <li className={activeTab === "past-invigilations" ? "active" : ""}>
                        <button onClick={() => setActiveTab("past-invigilations")}>
                            <i className="fas fa-history"></i> Past Invigilations
                        </button>
                    </li>
                    <li className="logout-item">
                        <button onClick={handleLogout}>
                            <i className="fas fa-sign-out-alt"></i> Logout
                        </button>
                    </li>
                </ul>
            </div>

            <div className="main-content">
                <header className="content-header">
                    <h1>
                        {activeTab === "dashboard" && "Dashboard"}
                        {activeTab === "invigilations" && "Current Invigilations"}
                        {activeTab === "past-invigilations" && "Past Invigilations"}
                    </h1>
                </header>

                {renderContent()}

                {showSwapModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>Request Swap for {currentInvigilation?.examName}</h3>
                            <div className="modal-details">
                                <p><strong>Date:</strong> {formatDate(currentInvigilation?.date)}</p>
                                <p><strong>Time:</strong> {currentInvigilation?.startTime} - {currentInvigilation?.endTime}</p>
                                <p><strong>Venue:</strong> {currentInvigilation?.venue}</p>
                            </div>
                            <div className="form-group">
                                <label htmlFor="facultyToSwapWith">Select Faculty to Swap With:</label>
                                <select
                                    id="facultyToSwapWith"
                                    value={selectedFacultyToSwapWith}
                                    onChange={(e) => setSelectedFacultyToSwapWith(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Faculty --</option>
                                    {facultyList.map(faculty => (
                                        <option key={faculty.username} value={faculty.username}>
                                            {faculty.name} ({faculty.department})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="swapReason">Reason for Swap:</label>
                                <textarea
                                    id="swapReason"
                                    value={swapReason}
                                    onChange={(e) => setSwapReason(e.target.value)}
                                    placeholder="Please explain why you need to swap this invigilation..."
                                    rows={5}
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button 
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowSwapModal(false);
                                        setSwapReason("");
                                        setSelectedFacultyToSwapWith("");
                                    }}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="submit-btn"
                                    onClick={handleSwapSubmit}
                                >
                                    Submit Request
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyDashboard;