import React, { useState } from "react";
import * as XLSX from "xlsx";
import "./Admindashboard.css";

const FacultyAssignment = () => {
  const [slots, setSlots] = useState(0);
  const [currentSlot, setCurrentSlot] = useState(0);
  const [slotDetails, setSlotDetails] = useState([]);
  const [facultyData, setFacultyData] = useState([]);
  const [timetable, setTimetable] = useState([]);
  const [examDetails, setExamDetails] = useState({
    subject: "",
    sectionsPerSlot: "",
    facultyPerSection: "",
    startTime: "",
    endTime: "",
    day: "Monday",
    date: "",
  });

  const handleChange = (e) => {
    setExamDetails({ ...examDetails, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      setTimetable(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSlotSubmission = () => {
    setSlotDetails([...slotDetails, { ...examDetails }]);
    setExamDetails({
      subject: "",
      sectionsPerSlot: "",
      facultyPerSection: "",
      startTime: "",
      endTime: "",
      day: "Monday",
      date: "",
    });
    setCurrentSlot(currentSlot + 1);
  };

  const resetAssignment = () => {
    setSlots(0);
    setCurrentSlot(0);
    setSlotDetails([]);
    setFacultyData([]);
    setExamDetails({
      subject: "",
      sectionsPerSlot: "",
      facultyPerSection: "",
      startTime: "",
      endTime: "",
      day: "Monday",
      date: "",
    });
  };

  const generateSchedule = () => {
    let assignedFaculty = [];
    let availableFaculty = {};

    timetable.forEach((entry) => {
      if (!availableFaculty[entry.Faculty]) {
        availableFaculty[entry.Faculty] = {};
      }
      if (!availableFaculty[entry.Faculty][entry.Day]) {
        availableFaculty[entry.Faculty][entry.Day] = new Set();
      }
      availableFaculty[entry.Faculty][entry.Day].add(entry["Time Slot"]);
    });

    slotDetails.forEach((slot, index) => {
      for (let j = 0; j < parseInt(slot.sectionsPerSlot, 10); j++) {
        let assigned = [];
        let available = Object.keys(availableFaculty).filter(
          (fac) =>
            availableFaculty[fac][slot.day] &&
            !availableFaculty[fac][slot.day].has(slot.startTime)
        );

        for (let k = 0; k < parseInt(slot.facultyPerSection, 10); k++) {
          if (available.length > 0) {
            const facultyIndex = Math.floor(Math.random() * available.length);
            const faculty = available.splice(facultyIndex, 1)[0];
            assigned.push(faculty);
            availableFaculty[faculty][slot.day].add(slot.startTime);
          }
        }
        assignedFaculty.push({
          date: slot.date,
          slot: index + 1,
          section: j + 1,
          faculty: assigned.length > 0 ? assigned.join(", ") : "No Available Faculty",
        });
      }
    });

    setFacultyData(assignedFaculty);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(facultyData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Faculty Assignment");
    XLSX.writeFile(wb, "faculty_assignment.xlsx");
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Faculty Assignment</h1>
      <input type="file" onChange={handleFileUpload} className="mb-4" />
      {slots === 0 ? (
        <div>
          <input
            type="number"
            placeholder="Enter number of slots"
            onChange={(e) => setSlots(Number(e.target.value))}
            className="border p-2 rounded w-full"
          />
        </div>
      ) : currentSlot < slots ? (
        <div>
          <h2 className="text-xl font-semibold">Slot {currentSlot + 1}</h2>
          {Object.keys(examDetails).map((key) =>
            key !== "day" && key !== "date" ? (
              <input
                key={key}
                name={key}
                placeholder={key.replace(/([A-Z])/g, " $1").trim()}
                value={examDetails[key]}
                onChange={handleChange}
                className="border p-2 rounded w-full mb-2"
              />
            ) : key === "day" ? (
              <select
                key={key}
                name={key}
                value={examDetails[key]}
                onChange={handleChange}
                className="border p-2 rounded w-full mb-2"
              >
                {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(
                  (day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  )
                )}
              </select>
            ) : (
              <input
                key={key}
                type="date"
                name={key}
                value={examDetails[key]}
                onChange={handleChange}
                className="border p-2 rounded w-full mb-2"
              />
            )
          )}
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4" onClick={handleSlotSubmission}>
            Next Slot
          </button>
        </div>
      ) : (
        <div>
          <button className="bg-blue-500 text-white px-4 py-2 rounded mt-4" onClick={generateSchedule}>
            Generate Schedule
          </button>
          <button className="bg-green-500 text-white px-4 py-2 rounded ml-2 mt-4" onClick={exportToExcel}>
            Export to Excel
          </button>
          <button className="bg-gray-500 text-white px-4 py-2 rounded ml-2 mt-4" onClick={resetAssignment}>
            Assign for Another Time
          </button>
          <div className="mt-6">
            <h2 className="text-xl font-semibold">Generated Schedule</h2>
            <ul>
              {facultyData.map((entry, index) => (
                <li key={index}>
                  {`Date: ${entry.date}, Slot ${entry.slot}, Section ${entry.section}: ${entry.faculty}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyAssignment;
