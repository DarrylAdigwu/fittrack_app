import React from "react";
import { Link } from "react-router";
import leftArr from "../../assets/images/left-arrow.svg";
import rightArr from "../../assets/images/right-arrow.svg";
import cancel from "../../assets/images/cancel.svg";
import "../../assets/css/calendar.css";
import { formatCurrentDate, dateWithoutTimezone } from "../../../client-utils";

export default function Calendar(props) {
  const [month, setMonth] = React.useState(new Date().getMonth());
  const [year, setYear] = React.useState(new Date().getFullYear());
  const getAllUserDates = props.allDates;
  
  // Array to hold dates
  const datesForUser = [];

  // Push dates into new array
  getAllUserDates.map((date) => datesForUser.push(dateWithoutTimezone(date)));
  
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
    const newCalDate = new Date(year, month, day);
    const removeDateTimezone = dateWithoutTimezone(newCalDate);
    const checkDate = !isNaN(newCalDate) ? removeDateTimezone : null;
    const validDate = !isNaN(newCalDate) ? `?date=${newCalDate}` : null;
   
    const dateContainer = datesForUser.includes(checkDate);
    const goldBorder = dateContainer ? "gold-border" : null;

    return(
      <Link 
        to={validDate} 
        key={index} 
        onClick={validDate && handleCloseCalendar} 
        aria-label={`link to schedule for ${validDate}`}
        reloadDocument
      >
        <div className={`date-containers ${goldBorder}`}>
          {day}
        </div>
      </Link>
    ) 
  });

  // Close calendar button
  function handleCloseCalendar(event) {
    const displayCal = document.getElementById("calendar-container");
    if(event) {
      displayCal.classList.remove("active");
    }
  }

  return(
    <div id="calendar-container" className="calendar-container">
      <div className="calendar">
        <button className="cancel-calendar" aria-label="button to close calendar drop down" onClick={handleCloseCalendar}>
          <img className="cancel-cal-img" src={cancel} alt="x icon representing exit" />
        </button>
        <div className="calendar-header">
          <button className="cal-button" id="prev-cal-month" onClick={prevMonth} aria-label="arrow button to previous month">
            <img 
              src={leftArr} 
              className="left-cal-arr" 
              alt="previous date arrow for calendar" 
              />
          </button>
          <span id="calender-display-date" className="calendar-display-date">
            {monthYear}
          </span>
          <button className="cal-button" id="next-cal-month" onClick={nextMonth} aria-label="arrow button to next month">
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