
import React, { useState } from 'react';
import './Contact.css';
import contactImage from './contactimg.png';
import './Navbar.css'; // Make sure you have Navbar.css in the same directory
import Navbar from './Navbar'; // Adjust the import path if necessary
const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        message: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const sendToWhatsApp = (e) => {
        e.preventDefault();

        const adminPhoneNumber = '7207547829';
        const message = encodeURIComponent(`
            New message from contact form:\n\nName: ${formData.fullName}\nEmail: ${formData.email}\nMessage: ${formData.message}`
        );

        const whatsappUrl = `https://wa.me/${adminPhoneNumber}?text=${message}`;
        window.open(whatsappUrl, '_blank');

        setFormData({
            fullName: '',
            email: '',
            message: '',
        });
    };

    return (
        <div className='contact'>
     <Navbar />
       
        <div className="contact-container">
    
            <div className="contact-box">
                <div className="contact-image">
                    <img src={contactImage} alt="Contact" />
                </div>
                <div className="contact-form-wrapper">
                    <h1>Contact Us</h1>
                    <form onSubmit={sendToWhatsApp} className="contact-form">
                        <div className="input-group">
                            <label>Enter your name</label>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Enter your mail</label>
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label>Message</label>
                            <textarea
                                name="message"
                                placeholder="Type your message..."
                                value={formData.message}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <button type="submit" className="contact-btn">
                            Submit
                        </button>
                    </form>
                </div>
            </div>
        </div>
        </div>
    );
};

export default Contact;