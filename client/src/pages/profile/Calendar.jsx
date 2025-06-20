import React from "react";
import leftArr from "../../assets/images/left-arrow.svg";
import rightArr from "../../assets/images/right-arrow.svg";
import "../../assets/css/calendar.css";

export default function Calendar() {
  const [month, setMonth] = React.useState(new Date().getMonth());
  const [year, setYear] = React.useState(new Date().getFullYear());

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  function prevMonth() {
    if(month === 0) {
      setYear((prev) => prev - 1);
      setMonth(12)
    }
    setMonth((prev) => prev - 1);
  }

  function nextMonth() {
    if(month === 11) {
      setYear((prev) => prev + 1);
      setMonth(-1)
    }
    setMonth((prev) => prev + 1);
  }

  const currentDate = new Date();
  const monthYear = `${months[month]} ${year}`;
  const startOfMonth = new Date(year, month, 1);
  const endOfMonth = new Date(year, month + 1, 0);
  const firstDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  // List of blank dates and populated dates
  let dateContainer = [];

  // Add blank dates to date containers
  for(let i = 0; i < firstDay; i++) {
    dateContainer.push(
      <div className="blank-dates"></div>
    )
  }

  // Add days to calendar
  for(let i = 1; i <= daysInMonth; i++) {
    const addDate = new Date(year, month, i).getDate();
    dateContainer.push(addDate);
  }

  // Map calendars to div for JSX
  const calendarDays = dateContainer.map((day, index) => {
    return(
      <div className="date-containers" key={index}>
        {day}
      </div>
    ) 
  });

  console.log(currentDate);
  console.log(firstDay);
  console.log(daysInMonth)
  console.log(startOfMonth);
  console.log(endOfMonth);
  console.log(dateContainer)

  return(
    <div id="calendar-container" className="calendar-container">
      <div className="calendar">
        <div className="calendar-header">
          <button className="cal-button" id="prev-cal-month" onClick={prevMonth}>
            <img 
              src={leftArr} 
              className="left-cal-arr" 
              alt="previous date arrow for calendar" 
              />
          </button>
          <span id="calender-display-date" className="calendar-display-date">
            {monthYear}
          </span>
          <button className="cal-button" id="next-cal-month" onClick={nextMonth}>
            <img 
              src={rightArr} 
              className="right-cal-arr" 
              alt="next date arrow for calendar" 
            />
          </button>
        </div>
        {/* Weekday Names */}
        <div className="calendar-body">
          <div className="calendar-weekdays">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>
          {/* Dates will be populated here */}
          <div id="calendar-dates" className="calendar-dates">
            {calendarDays}
          </div>
        </div>
      </div>
    </div>
  )
}