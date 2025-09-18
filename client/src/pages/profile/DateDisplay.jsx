import React from "react";
import rightArr from "../../assets/images/right-arrow.svg";
import leftArr from "../../assets/images/left-arrow.svg";
import calendar from "../../assets/images/calendar.svg";
import { formatCurrentDate } from "../../../client-utils";

export default function DateDisplay(props) {

  // Display previous date
  function prevDate() {
    // Document elements
    const showContainer = document.getElementById("workout-form");
    const noScheduleContainer = document.getElementById("no-schedule");
    const scheduleContainer = document.getElementById("schedule");
    //const editScheduleForm = document.getElementById("edit-exercise-form-section");
    const firstInputBoxes = document.getElementById("exercise-form");
    const firstInputBoxesContainers = firstInputBoxes.querySelectorAll(".inputBoxes");
    const firstInputBoxesChildren = firstInputBoxes.querySelectorAll("input");

    // Remove schedule, hide workout form, if no planne workout show no schedule container
    if(scheduleContainer && !scheduleContainer.classList.contains("inactive") && props.plannedWorkout === null) {
      //scheduleContainer.classList.add("inactive");
    }
    if(showContainer && showContainer.classList.contains("active")) {
      showContainer.classList.remove("active");
    }
    if(noScheduleContainer && noScheduleContainer.classList.contains("inactive") && !props.plannedWorkout) {
      noScheduleContainer.classList.remove("inactive")
    }

    // Clear former inputs and input containers
    firstInputBoxesChildren.forEach((input) => {
      input.value = ""
    });

    firstInputBoxesContainers.forEach((child) => {
      if(child !== document.getElementById("inputBoxes1")) {
        firstInputBoxes.removeChild(child)
      }
    });

    props.setExerciseCount(() => 2);
    props.refCount.current = 1;

    if(props.dateParam) {
      props.setSearchParams((prev) => {
        const prevParam = new Date(prev.get("date"));
        const prevDate = prevParam.setDate(prevParam.getDate() - 1);
        return { "date": formatCurrentDate(prevDate)}
      });
    }

    if(!props.dateParam) {
      props.setShowDate((prev) => {
        const currentDate = new Date(prev);
        const prevDate = currentDate.setDate(currentDate.getDate() - 1);
        return prevDate;
      });

      props.setSearchParams({"date": formatCurrentDate(showDate)});
    }
  };

  // Display next date
  function nextDate() {
    // Document elements
    const showContainer = document.getElementById("workout-form");
    const noScheduleContainer = document.getElementById("no-schedule");
    const scheduleContainer = document.getElementById("schedule");
    const editScheduleForm = document.getElementById("edit-exercise-form-section");
    const firstInputBoxes = document.getElementById("exercise-form");
    const firstInputBoxesContainers = firstInputBoxes.querySelectorAll(".inputBoxes");
    const firstInputBoxesChildren = firstInputBoxes.querySelectorAll("input");

    
    if(showContainer && showContainer.classList.contains("active")) {
      showContainer.classList.remove("active");
    }
    if(noScheduleContainer && noScheduleContainer.classList.contains("inactive") && !props.plannedWorkout) {
      noScheduleContainer.classList.remove("inactive")
    }

    firstInputBoxesChildren.forEach((input) => {
      input.value = ""
    });

    firstInputBoxesContainers.forEach((child) => {
      if(child !== document.getElementById("inputBoxes1")) {
        firstInputBoxes.removeChild(child)
      }
    });

    props.setExerciseCount(() => 2);
    props.refCount.current = 1;

    if(props.dateParam) {
      props.setSearchParams((prev) => {
        const nextParam = new Date(prev.get("date"));
        const nextDate = nextParam.setDate(nextParam.getDate() + 1);
        return { "date": formatCurrentDate(nextDate)}
      });
    }

    if(props.dateParam === null) {
      props.setShowDate((prev) => {
        const currentDate = new Date(prev);
        const nextDate = currentDate.setDate(currentDate.getDate() + 1);
        return nextDate;
      });

      props.setSearchParams({"date": formatCurrentDate(showDate)});
    }
  };

    // Set date based on search params
    React.useEffect(() => {
      if(props.dateParam) {
        try {
          const paramDate = new Date(props.dateParam);
          if(!isNaN(paramDate)) {
            props.setShowDate(paramDate)
            props.setSearchParams({ "date": formatCurrentDate(paramDate)})
          }
        } catch(err) {
          console.error("Error parsing date", err)
        }
      } 
    }, [props.dateParam]);


    // Drop down calendar 
    function handleCalendar(event) {
      const displayCal = document.getElementById("calendar-container");
      const actionsMenu = document.querySelector("div.table-actions-menu");
      const pastDateButton = document.getElementById("past-date");
      const futureDateButton = document.getElementById("future-date");

      if(event) {
        displayCal.classList.toggle("active");

        if(actionsMenu && actionsMenu.classList.contains("active")) {
          actionsMenu.classList.remove("active");
        }
        
        if(pastDateButton.classList.contains("inactive") 
          || futureDateButton.classList.contains("inactive")) {
            futureDateButton.classList.remove("inactive")
            pastDateButton.classList.remove("inactive")
        }
      }
    }

  return(
    <div className="displayDate">
      <button 
        id="past-date" 
        onClick={() => prevDate()}
      >
        <img 
          src={leftArr} 
          alt="left button arrow to change date to day before" 
          aria-roledescription="button"
        />
      </button>

      <button 
        className="calendar-button" 
        onClick={handleCalendar} 
      >
        <span aria-label="date">
          {formatCurrentDate(props.showDate, "none")}
        </span>
        <img 
          src={calendar} 
          alt="button to drop down calendar" 
          aria-roledescription="button"
        />
      </button>

      <button 
        id="future-date" 
        onClick={() => nextDate()}
      >
        <img 
          src={rightArr} 
          alt="right button arrow to change date to day after" 
          aria-roledescription="button"
        />
      </button>
    </div>
  )
}