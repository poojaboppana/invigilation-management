import React from "react";
import "./About.css"; // Import the associated CSS file
import image from "./professor1.png"; // Import the associated image file

const About = () => {
  return (
    <div className="about-container">
    
      

      {/* About Us Section */}
      <section className="about-us">
        <div className="content">
          <h1>Helping education institutions manage invigilation efficiently</h1>
          <p>
            The Invigilation Management System (IMS) is designed to optimize exam invigilation,
            scheduling, and supervision. By automating and streamlining the invigilation process, 
            the system ensures smooth exam execution, reducing human errors and improving efficiency.
          </p>
          <a href="/register" className="cta-button">Sign Up for Free</a>
        </div>
        <div className="image">
          <img src={image} alt="Invigilation" />
        </div>
      </section>
    </div>
  );
};

export default About;
