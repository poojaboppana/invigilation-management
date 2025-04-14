import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import "./Admindashboard.css";

const AdminDashboard = () => {
  // State management
  const [slots, setSlots] = useState(0);
  const [currentSlot, setCurrentSlot] = useState(0);
  const [slotDetails, setSlotDetails] = useState([]);
  const [facultyData, setFacultyData] = useState([]);
  const [examDetails, setExamDetails] = useState({
    subject: "",
    examType: "",
    year: "",
    sectionsPerSlot: "",
    facultyPerSection: "",
    startTime: "",
    endTime: "",
    date: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [swapRequests, setSwapRequests] = useState([]);
  const [pastExams, setPastExams] = useState([]);
  const [activeTab, setActiveTab] = useState("createExam");
  const [manualAssignmentData, setManualAssignmentData] = useState(null);
  const [selectedReplacement, setSelectedReplacement] = useState("");

  // Fetch faculty data on component mount
  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/faculty");
        setFacultyList(response.data);
      } catch (error) {
        console.error("Error fetching faculty data:", error);
        alert("Failed to load faculty data");
      }
    };
    fetchFacultyData();
  }, []);

  // Fetch swap requests
  useEffect(() => {
    const fetchSwapRequests = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/swap-requests"
        );
        setSwapRequests(response.data);
      } catch (error) {
        console.error("Error fetching swap requests:", error);
        alert("Failed to load swap requests");
      }
    };
    if (activeTab === "swapRequests") {
      fetchSwapRequests();
    }
  }, [activeTab]);

  // Fetch past exams
  useEffect(() => {
    const fetchPastExams = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/api/exams/completed"
        );
        setPastExams(response.data);
      } catch (error) {
        console.error("Error fetching past exams:", error);
        alert("Failed to load past exams");
      }
    };
    if (activeTab === "pastExams") {
      fetchPastExams();
    }
  }, [activeTab]);

  // Form validation
  const validateExamDetails = () => {
    const newErrors = {};
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const todayDateStr = now.toISOString().split("T")[0];

    if (!examDetails.subject) newErrors.subject = "Subject is required";
    if (!examDetails.examType) newErrors.examType = "Exam type is required";
    if (
      ["T1-Exam", "T4-Exam"].includes(examDetails.examType) &&
      !examDetails.year
    ) {
      newErrors.year = "Year is required for this exam type";
    }
    if (!examDetails.sectionsPerSlot)
      newErrors.sectionsPerSlot = "Number of sections is required";
    if (!examDetails.facultyPerSection)
      newErrors.facultyPerSection = "Faculty per section is required";
    if (!examDetails.date) newErrors.date = "Exam date is required";
    if (!examDetails.startTime) newErrors.startTime = "Start time is required";
    if (!examDetails.endTime) newErrors.endTime = "End time is required";

    if (examDetails.date) {
      const selectedDate = new Date(examDetails.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.date = "Exam date cannot be in the past";
      }
    }

    if (examDetails.date && examDetails.startTime) {
      const selectedDate = new Date(examDetails.date).toISOString().split("T")[0];

      if (selectedDate === todayDateStr) {
        const [startHour, startMin] = examDetails.startTime
          .split(":")
          .map(Number);

        if (
          startHour < currentHours ||
          (startHour === currentHours && startMin <= currentMinutes)
        ) {
          newErrors.startTime = `Start time must be after ${currentHours}:${currentMinutes
            .toString()
            .padStart(2, "0")}`;
        }
      }
    }

    if (examDetails.startTime && examDetails.endTime) {
      const startMinutes = timeToMinutes(examDetails.startTime);
      const endMinutes = timeToMinutes(examDetails.endTime);
      const duration = endMinutes - startMinutes;

      if (startMinutes >= endMinutes) {
        newErrors.endTime = "End time must be after start time";
      }

      // Enforce 1-hour duration for T1 and T4 exams
      if (
        ["T1-Exam", "T4-Exam"].includes(examDetails.examType) &&
        duration !== 60
      ) {
        newErrors.endTime = "T1 and T4 exams must be exactly 1 hour long";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Helper function to convert time to minutes
  const timeToMinutes = (time) => {
    if (!time) return 0;
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setExamDetails((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Submit slot details
  const handleSlotSubmission = () => {
    if (!validateExamDetails()) {
      return;
    }

    const day = new Date(examDetails.date).toLocaleDateString("en-US", {
      weekday: "long",
    });
    const slotNumber = currentSlot + 1;

    setSlotDetails([
      ...slotDetails,
      {
        ...examDetails,
        day,
        slotNumber,
        sectionsPerSlot: parseInt(examDetails.sectionsPerSlot, 10),
        facultyPerSection: parseInt(examDetails.facultyPerSection, 10),
      },
    ]);

    setExamDetails({
      subject: "",
      examType: examDetails.examType, // Keep examType for all slots
      year: examDetails.year, // Keep year for all slots
      sectionsPerSlot: "",
      facultyPerSection: "",
      startTime: "",
      endTime: "",
      date: "",
    });

    setCurrentSlot(currentSlot + 1);
    setErrors({});
  };

  // Generate faculty assignment schedule
  const generateSchedule = async () => {
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        "http://localhost:5000/api/exams/generate-schedule",
        {
          slotDetails,
          facultyPerSection: parseInt(slotDetails[0].facultyPerSection, 10),
          examType: slotDetails[0].examType,
          year: slotDetails[0].year,
        }
      );

      setFacultyData(response.data);
    } catch (error) {
      console.error("Error generating schedule:", error);
      if (error.response?.data?.requiresManualAssignment) {
        setManualAssignmentData(error.response.data.examDetails);
        alert(
          `Not enough faculty available for ${error.response.data.examDetails.examName} (Slot ${error.response.data.examDetails.slotNumber}, Section ${error.response.data.examDetails.sectionNumber}). Please assign faculty manually.`
        );
      } else {
        alert(
          error.response?.data?.message ||
            "Failed to generate schedule. Please check your input and try again."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm exam allotment
  const confirmAllotment = async () => {
    setIsSubmitting(true);
    try {
      const examData = {
        examName: slotDetails[0].subject,
        examType: slotDetails[0].examType,
        year: ["T1-Exam", "T4-Exam"].includes(slotDetails[0].examType)
          ? slotDetails[0].year
          : undefined,
        slots: slotDetails.map((slot, index) => ({
          slotNumber: index + 1,
          subject: slot.subject,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          sections: facultyData
            .filter((f) => f.slot === index + 1)
            .reduce((acc, curr) => {
              const existingSection = acc.find(
                (s) => s.sectionNumber === curr.section
              );
              if (existingSection) {
                existingSection.faculty.push(
                  ...curr.faculty.map((f) => ({
                    username: f.username,
                    name: f.name,
                    status: "Assigned",
                  }))
                );
              } else {
                acc.push({
                  sectionNumber: curr.section,
                  faculty: curr.faculty.map((f) => ({
                    username: f.username,
                    name: f.name,
                    status: "Assigned",
                  })),
                });
              }
              return acc;
            }, []),
        })),
      };

      const response = await axios.post("http://localhost:5000/api/exams", examData);
      await axios.post("http://localhost:5000/api/notify-faculty", {
        examId: response.data._id,
      });

      alert("Exam allotment confirmed and faculty notified!");
      resetAssignment();
    } catch (error) {
      console.error("Error confirming allotment:", error);
      alert("Failed to confirm allotment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle manual faculty assignment
  const handleManualAssignment = async () => {
    if (!selectedReplacement) {
      alert("Please select a replacement faculty");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/exams/manual-assignment", {
        examId: manualAssignmentData.examId || "temp-id",
        slotNumber: manualAssignmentData.slotNumber,
        sectionNumber: manualAssignmentData.sectionNumber,
        requestingUsername: manualAssignmentData.requestingUsername || "no-faculty",
        replacementUsername: selectedReplacement,
      });

      alert("Manual assignment completed successfully!");
      setManualAssignmentData(null);
      setSelectedReplacement("");
      await generateSchedule();
    } catch (error) {
      console.error("Manual assignment error:", error);
      alert(error.response?.data?.message || "Failed to complete manual assignment");
    }
  };

  // Handle swap request approval/rejection
  const handleSwapRequestAction = async (requestId, action) => {
    try {
      await axios.put(`http://localhost:5000/api/swap-requests/${requestId}`, {
        action,
      });

      const updatedRequests = await axios.get(
        "http://localhost:5000/api/swap-requests"
      );
      setSwapRequests(updatedRequests.data);

      alert(`Swap request ${action}d successfully`);
    } catch (error) {
      console.error(`Error ${action}ing swap request:`, error);
      alert(`Failed to ${action} swap request`);
    }
  };

  // Mark exams as completed
  const markExamsAsCompleted = async () => {
    try {
      const response = await axios.put(
        "http://localhost:5000/api/exams/mark-completed"
      );
      alert(response.data.message);
      const updatedExams = await axios.get(
        "http://localhost:5000/api/exams/completed"
      );
      setPastExams(updatedExams.data);
    } catch (error) {
      console.error("Error marking exams as completed:", error);
      alert("Failed to mark exams as completed");
    }
  };

  // Reset form
  const resetAssignment = () => {
    setSlots(0);
    setCurrentSlot(0);
    setSlotDetails([]);
    setFacultyData([]);
    setExamDetails({
      subject: "",
      examType: "",
      year: "",
      sectionsPerSlot: "",
      facultyPerSection: "",
      startTime: "",
      endTime: "",
      date: "",
    });
    setErrors({});
    setManualAssignmentData(null);
    setSelectedReplacement("");
  };

  // Export to Excel
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      facultyData.map((entry) => ({
        Date: entry.date,
        Day: entry.day,
        Slot: entry.slot,
        Section: entry.section,
        Subject: entry.subject,
        Time: `${entry.startTime} - ${entry.endTime}`,
        Faculty: entry.faculty.map((f) => f.name).join(", "),
      }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty Assignment");
    XLSX.writeFile(wb, "faculty_assignment.xlsx");
  };

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <h2 className="sidebar-title">Invigilation Admin</h2>
        <ul className="sidebar-menu">
          <li>
            <button
              className={activeTab === "createExam" ? "active" : ""}
              onClick={() => setActiveTab("createExam")}
            >
              Create Exam
            </button>
          </li>
          <li>
            <button
              className={activeTab === "pastExams" ? "active" : ""}
              onClick={() => setActiveTab("pastExams")}
            >
              Past Exams
            </button>
          </li>
          <li>
            <button
              className={activeTab === "swapRequests" ? "active" : ""}
              onClick={() => setActiveTab("swapRequests")}
            >
              Swap Requests
            </button>
          </li>
          <li>
            <a href="/logout">Logout</a>
          </li>
        </ul>
      </div>

      <div className="main-content">
        <header className="content-header">
          <h1>Exam Invigilation Management</h1>
        </header>

        {activeTab === "createExam" && (
          <section className="assignment-card">
            <h2 className="card-title">Exam Scheduling</h2>

            {slots === 0 ? (
              <div className="slot-input">
                <label htmlFor="slots">Number of Exam Slots:</label>
                <input
                  type="number"
                  id="slots"
                  placeholder="Enter number of slots"
                  onChange={(e) => setSlots(Number(e.target.value))}
                  min="1"
                />
                <button
                  className="submit-btn"
                  onClick={() =>
                    setSlots(Number(document.getElementById("slots").value))
                  }
                >
                  Continue
                </button>
              </div>
            ) : currentSlot < slots ? (
              <div className="slot-form">
                <h3 className="slot-title">Slot {currentSlot + 1} Details</h3>

                {/* Exam Type Selection */}
                <div className="form-group">
                  <label>Exam Type:</label>
                  <select
                    name="examType"
                    value={examDetails.examType}
                    onChange={handleChange}
                    className={errors.examType ? "error" : ""}
                    disabled={currentSlot > 0}
                  >
                    <option value="">Select Exam Type</option>
                    <option value="T1-Exam">T1-Exam</option>
                    <option value="T4-Exam">T4-Exam</option>
                    <option value="External">External</option>
                    <option value="Semester">Semester</option>
                  </select>
                  {errors.examType && (
                    <span className="error-message">{errors.examType}</span>
                  )}
                </div>

                {/* Year Selection (only for T1-T4 exams) */}
                {["T1-Exam", "T4-Exam"].includes(examDetails.examType) && (
                  <div className="form-group">
                    <label>Year:</label>
                    <select
                      name="year"
                      value={examDetails.year}
                      onChange={handleChange}
                      className={errors.year ? "error" : ""}
                      disabled={currentSlot > 0}
                    >
                      <option value="">Select Year</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4">4</option>
                      <option value="All">All</option>
                    </select>
                    {errors.year && (
                      <span className="error-message">{errors.year}</span>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label>Subject:</label>
                  <input
                    type="text"
                    name="subject"
                    value={examDetails.subject}
                    onChange={handleChange}
                    placeholder="Enter subject name"
                    className={errors.subject ? "error" : ""}
                  />
                  {errors.subject && (
                    <span className="error-message">{errors.subject}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Number of Sections:</label>
                  <input
                    type="number"
                    name="sectionsPerSlot"
                    value={examDetails.sectionsPerSlot}
                    onChange={handleChange}
                    placeholder="Sections per slot"
                    min="1"
                    className={errors.sectionsPerSlot ? "error" : ""}
                  />
                  {errors.sectionsPerSlot && (
                    <span className="error-message">{errors.sectionsPerSlot}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Faculty per Section:</label>
                  <input
                    type="number"
                    name="facultyPerSection"
                    value={examDetails.facultyPerSection}
                    onChange={handleChange}
                    placeholder="Faculty per section"
                    min="1"
                    className={errors.facultyPerSection ? "error" : ""}
                  />
                  {errors.facultyPerSection && (
                    <span className="error-message">{errors.facultyPerSection}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Exam Date:</label>
                  <input
                    type="date"
                    name="date"
                    value={examDetails.date}
                    onChange={handleChange}
                    min={new Date().toISOString().split("T")[0]}
                    className={errors.date ? "error" : ""}
                  />
                  {errors.date && (
                    <span className="error-message">{errors.date}</span>
                  )}
                </div>
                <div className="time-inputs">
                  <div className="form-group">
                    <label>Start Time:</label>
                    <input
                      type="time"
                      name="startTime"
                      value={examDetails.startTime}
                      onChange={handleChange}
                      className={errors.startTime ? "error" : ""}
                    />
                    {errors.startTime && (
                      <span className="error-message">{errors.startTime}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>End Time:</label>
                    <input
                      type="time"
                      name="endTime"
                      value={examDetails.endTime}
                      onChange={handleChange}
                      className={errors.endTime ? "error" : ""}
                      min={examDetails.startTime || "00:00"}
                      disabled={!examDetails.startTime}
                    />
                    {errors.endTime && (
                      <span className="error-message">{errors.endTime}</span>
                    )}
                  </div>
                </div>
                <button className="submit-btn" onClick={handleSlotSubmission}>
                  {currentSlot === slots - 1 ? "Submit All Slots" : "Next Slot"}
                </button>
              </div>
            ) : (
              <div className="assignment-actions">
                <div className="action-buttons">
                  <button
                    className="generate-btn"
                    onClick={generateSchedule}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Generating..." : "Generate Schedule"}
                  </button>
                  {facultyData.length > 0 && (
                    <>
                      <button
                        className="confirm-btn"
                        onClick={confirmAllotment}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Processing..." : "Confirm Allotment"}
                      </button>
                      <button className="export-btn" onClick={exportToExcel}>
                        Export to Excel
                      </button>
                    </>
                  )}
                  <button className="reset-btn" onClick={resetAssignment}>
                    New Assignment
                  </button>
                </div>

                {facultyData.length > 0 && (
                  <div className="schedule-results">
                    <h3>Generated Invigilation Schedule</h3>
                    <div className="schedule-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Day</th>
                            <th>Slot</th>
                            <th>Section</th>
                            <th>Subject</th>
                            <th>Time</th>
                            <th>Assigned Faculty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {facultyData.map((entry, index) => (
                            <tr key={index}>
                              <td>{entry.date}</td>
                              <td>{entry.day}</td>
                              <td>{entry.slot}</td>
                              <td>{entry.section}</td>
                              <td>{entry.subject}</td>
                              <td>
                                {entry.startTime} - {entry.endTime}
                              </td>
                              <td>
                                {entry.faculty.map((faculty, idx) => (
                                  <div key={idx}>
                                    {faculty.name}
                                  </div>
                                ))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {activeTab === "pastExams" && (
          <section className="past-exams">
            <h2>Completed Exams</h2>
            <button
              onClick={markExamsAsCompleted}
              className="mark-completed-btn"
            >
              Mark Past Exams as Completed
            </button>
            {pastExams.length === 0 ? (
              <p>No completed exams found</p>
            ) : (
              <div className="exams-table">
                <table>
                  <thead>
                    <tr>
                      <th>Exam Name</th>
                      <th>Type</th>
                      <th>Year</th>
                      <th>Date</th>
                      <th>Slots</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastExams.map((exam) => (
                      <tr key={exam._id}>
                        <td>{exam.examName}</td>
                        <td>{exam.examType}</td>
                        <td>{exam.year || "N/A"}</td>
                        <td>{new Date(exam.date).toLocaleDateString()}</td>
                        <td>{exam.slots.length}</td>
                        <td>{exam.status}</td>
                        <td>
                          <button
                            className="details-btn"
                            onClick={async () => {
                              try {
                                const response = await axios.get(
                                  `http://localhost:5000/api/exams/${exam._id}/details`
                                );
                                const details = `
                                  Exam: ${response.data.examName}
                                  Type: ${response.data.examType}
                                  Date: ${new Date(
                                    response.data.date
                                  ).toLocaleDateString()}
                                  Status: ${response.data.status}
                                  
                                  Slots:
                                  ${response.data.slots
                                    .map(
                                      (slot) => `
                                    Slot ${slot.slotNumber}:
                                    - Subject: ${slot.subject}
                                    - Date: ${new Date(
                                      slot.date
                                    ).toLocaleDateString()}
                                    - Time: ${slot.startTime} - ${slot.endTime}
                                    - Sections: ${slot.sections
                                      .map(
                                        (section) =>
                                          `Section ${section.sectionNumber}: ${section.faculty
                                            .map((f) => f.name)
                                            .join(", ")}`
                                      )
                                      .join("\n")}
                                  `
                                    )
                                    .join("\n")}
                                `;
                                alert(details);
                              } catch (error) {
                                console.error(
                                  "Error fetching exam details:",
                                  error
                                );
                                alert("Failed to load exam details");
                              }
                            }}
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === "swapRequests" && (
          <section className="swap-requests">
            <h2>Pending Swap Requests</h2>
            {swapRequests.length === 0 ? (
              <p>No pending swap requests</p>
            ) : (
              <div className="requests-table">
                <table>
                  <thead>
                    <tr>
                      <th>Faculty</th>
                      <th>Exam</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Reason</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {swapRequests.map((request) => (
                      <tr key={request._id}>
                        <td>
                          {request.requestingFaculty?.name ||
                            request.requestingUsername}
                        </td>
                        <td>{request.examId?.examName || "Exam"}</td>
                        <td>
                          {new Date(
                            request.invigilationId?.date
                          ).toLocaleDateString()}
                        </td>
                        <td>
                          {request.invigilationId?.startTime} -{" "}
                          {request.invigilationId?.endTime}
                        </td>
                        <td>{request.reason}</td>
                        <td>
                          <button
                            className="approve-btn"
                            onClick={() =>
                              handleSwapRequestAction(request._id, "approve")
                            }
                          >
                            Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() =>
                              handleSwapRequestAction(request._id, "reject")
                            }
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {manualAssignmentData && (
          <div className="modal-overlay">
            <div className="manual-assignment-modal">
              <h3>Manual Faculty Assignment Required</h3>
              <div className="assignment-details">
                <p>
                  <strong>Exam:</strong> {manualAssignmentData.examName}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(manualAssignmentData.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {manualAssignmentData.startTime} -{" "}
                  {manualAssignmentData.endTime}
                </p>
                <p>
                  <strong>Slot:</strong> {manualAssignmentData.slotNumber}
                </p>
                <p>
                  <strong>Section:</strong> {manualAssignmentData.sectionNumber}
                </p>
              </div>

              <div className="form-group">
                <label>Select Replacement Faculty:</label>
                <select
                  value={selectedReplacement}
                  onChange={(e) => setSelectedReplacement(e.target.value)}
                >
                  <option value="">Select Faculty</option>
                  {facultyList.map((faculty) => (
                    <option key={faculty.username} value={faculty.username}>
                      {faculty.name} ({faculty.department})
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-buttons">
                <button className="confirm-btn" onClick={handleManualAssignment}>
                  Confirm Assignment
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => {
                    setManualAssignmentData(null);
                    setSelectedReplacement("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;