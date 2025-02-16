// Import Dependencies
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "./Facultydashboard.css";

const FacultyDashboard = ({ facultyId }) => {
    const [invigilations, setInvigilations] = useState([]);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        // Fetch faculty invigilations
        axios.get(`http://localhost:5000/api/faculty/${facultyId}/invigilations`)
            .then(response => setInvigilations(response.data))
            .catch(error => console.error('Error fetching invigilations:', error));
        
        // Fetch notifications
        axios.get(`http://localhost:5000/api/faculty/${facultyId}/notifications`)
            .then(response => setNotifications(response.data))
            .catch(error => console.error('Error fetching notifications:', error));
    }, [facultyId]);

    return (
        <div className="faculty-container">
            <h2>Faculty Dashboard</h2>
            
            {/* Invigilations Section */}
            <div className="section-box">
                <h3>Your Invigilations</h3>
                {invigilations.length > 0 ? (
                    <ul>
                        {invigilations.map((inv, index) => (
                            <li key={index}>
                                {inv.exam_name} - {inv.exam_date} ({inv.exam_time}) - Hall {inv.hall_no}
                            </li>
                        ))}
                    </ul>
                ) : (<p>No invigilations assigned.</p>)}
            </div>
    
            {/* Notifications Section */}
            <div className="section-box">
                <h3>Notifications</h3>
                {notifications.length > 0 ? (
                    <ul>
                        {notifications.map((note, index) => (
                            <li key={index}>{note.message}</li>
                        ))}
                    </ul>
                ) : (<p>No new notifications.</p>)}
            </div>
        </div>
    );
    
};

export default FacultyDashboard;
