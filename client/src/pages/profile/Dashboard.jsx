import React from "react";
import { Form, useActionData, useLoaderData, useNavigation, useSearchParams } from "react-router";
import "../../assets/css/dashboard.css";
import plusIcon from "../../assets/images/plusIcon.svg";
import minusIcon from "../../assets/images/minusIcon.svg";
import threeDot from "../../assets/images/three-dot-menu.svg";
import trash from "../../assets/images/trash.svg";
import cancel from "../../assets/images/cancel.svg";
import leftArr from "../../assets/images/left-arrow.svg";
import calendar from "../../assets/images/calendar.svg";
import rightArr from "../../assets/images/right-arrow.svg";
import { sendUserData, getTodaysWorkout, formatCurrentDate,
   usersUsername, getAllDates } from "../../../client-utils";
import Calendar from "./Calendar.jsx";


export async function loader({ request }) {
  const getDates = await getAllDates();
  return getDates;
}

export async function action({ request }) {
  const formData = await request.formData();
  const allData = Object.fromEntries(formData);
  
  // Send new data to server
  if(request.method === "POST") {
    const sendFormData = await sendUserData(`dashboard/${usersUsername}`, allData, "POST");
    
    if(sendFormData.serverError) {
      return sendFormData.serverError;
    }
  
    if(sendFormData.serverCheck.valid) {
      return window.location.reload();
    }
  }

  // Send Updated data to server
  if(request.method === "PUT") {
    // Send data to server
    const updatedExerciseFormData = await sendUserData(`dashboard/${usersUsername}`, allData, "PUT");
    
    if(updatedExerciseFormData.serverError) {
      return updatedExerciseFormData.serverError;
    }

    if(updatedExerciseFormData.serverCheck.valid) {
      return window.location.reload();
    }
  }

  // Send server data to delete
  if(request.method === "DELETE") {
    // Object to hold deleted data id's
    let dataDelete = {};

    // loop through form data object and get id's and push to dataDelet obj
    for(const [key, value] of Object.entries(allData)) {
      if(key.startsWith("checkbox") || key.startsWith("displayDate")) {
         dataDelete[`${key}`] = value;
      }
    }
    
    // Send dataDelete obj to server
    const sendWorkouts = await sendUserData(`dashboard/${usersUsername}`, dataDelete, "DELETE");
    
    // refresh page when workouts are deleted
    if(sendWorkouts.serverCheck.valid) {
      return window.location.reload()
    }
    
  }
}

export default function Dashboard() {
  const dashLoader = useLoaderData();
  const actionData = useActionData();
  const [exerciseCount, setExerciseCount] = React.useState(2);
  const [searchParams, setSearchParams] = useSearchParams(`?date=${new Date()}`);
  const [showDate, setShowDate] = React.useState();
  const [plannedWorkout, setPlannedWorkout] = React.useState();
  const navigation = useNavigation();
  const refCount = React.useRef(1);

  // Submitting state 
  const isSubmitting = navigation.state === "submitting";

  // Get value for date search param state
  const dateParam = searchParams.get("date");

  // Get key and make it string if error in form 
  let key = actionData ? Object.keys(actionData).toString() : null;

  // Get all workout dates
  const allUserDates = dashLoader.allDates;

  // Display previous date
  function prevDate() {
    // Document elements
    const showContainer = document.getElementById("workout-form");
    const noScheduleContainer = document.getElementById("no-schedule");
    const scheduleContainer = document.getElementById("schedule");
    const firstInputBoxes = document.getElementById("exercise-form");
    const firstInputBoxesContainers = firstInputBoxes.querySelectorAll(".inputBoxes");
    const firstInputBoxesChildren = firstInputBoxes.querySelectorAll("input");

    // Remove schedule, hide workout form, if no planne workout show no schedule container
    if(scheduleContainer && !scheduleContainer.classList.contains("inactive") && plannedWorkout === null) {
      scheduleContainer.classList.add("inactive");
    }
    if(showContainer && showContainer.classList.contains("active")) {
      showContainer.classList.remove("active");
    }
    if(noScheduleContainer && noScheduleContainer.classList.contains("inactive") && !plannedWorkout) {
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

    setExerciseCount(() => 2);
    refCount.current = 1;

    if(dateParam) {
      setSearchParams((prev) => {
        const prevParam = new Date(prev.get("date"));
        const prevDate = prevParam.setDate(prevParam.getDate() - 1);
        return { "date": formatCurrentDate(prevDate)}
      });
    }

    if(!dateParam) {
      setShowDate((prev) => {
        const currentDate = new Date(prev);
        const prevDate = currentDate.setDate(currentDate.getDate() - 1);
        return prevDate;
      });

      setSearchParams({"date": formatCurrentDate(showDate)});
    }
  };

  // Display next date
  function nextDate() {
    // Document elements
    const showContainer = document.getElementById("workout-form");
    const noScheduleContainer = document.getElementById("no-schedule");
    const scheduleContainer = document.getElementById("schedule");
    const firstInputBoxes = document.getElementById("exercise-form");
    const firstInputBoxesContainers = firstInputBoxes.querySelectorAll(".inputBoxes");
    const firstInputBoxesChildren = firstInputBoxes.querySelectorAll("input");

    // Remove schedule, hide workout form, if no planne workout show no schedule container
    if(scheduleContainer && !scheduleContainer.classList.contains("inactive") && plannedWorkout === null) {
      scheduleContainer.classList.toggle("inactive");
    }
    if(showContainer && showContainer.classList.contains("active")) {
      showContainer.classList.toggle("active");
    }
    if(noScheduleContainer && noScheduleContainer.classList.contains("inactive") && !plannedWorkout) {
      noScheduleContainer.classList.toggle("inactive")
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

    setExerciseCount(() => 2);
    refCount.current = 1;

    if(dateParam) {
      setSearchParams((prev) => {
        const nextParam = new Date(prev.get("date"));
        const nextDate = nextParam.setDate(nextParam.getDate() + 1);
        return { "date": formatCurrentDate(nextDate)}
      });
    }

    if(dateParam === null) {
      setShowDate((prev) => {
        const currentDate = new Date(prev);
        const nextDate = currentDate.setDate(currentDate.getDate() + 1);
        return nextDate;
      });

      setSearchParams({"date": formatCurrentDate(showDate)});
    }
  };


  // Set date based on search params
  React.useEffect(() => {
      if(dateParam) {
        try {
          const paramDate = new Date(dateParam);
          if(!isNaN(paramDate)) {
            setShowDate(paramDate)
            setSearchParams({ "date": formatCurrentDate(paramDate)})
          }
        } catch(err) {
          console.error("Error parsing date", err)
        }
      } 
  }, [dateParam])


  // Load for current dates workout using show date
  React.useEffect(() => {
    async function loadTodaysWorkout() {
      try {
        const getExercise = await getTodaysWorkout(formatCurrentDate(new Date(dateParam)));
        setPlannedWorkout(getExercise.getWorkout)
      } catch(err) {
        console.error("Load current date workout error:", err)
      }
    }
    
    loadTodaysWorkout();
  }, [showDate]);


  // Toggle drop down nav
  function handleDropDown(event) {
    const threeDotButton = document.querySelector("button.threeDotImg");
    const actionsMenu = document.querySelector("div.table-actions-menu")
    
    if(event) {
      threeDotButton.classList.toggle("active");
      actionsMenu.classList.toggle("active");
    }
  }

  
  // Display table for planned workout
  const todaysSchedule = plannedWorkout ? 
  plannedWorkout.map((workouts) => {
    return (                                                                                                                                                                    
      <div key={workouts.id} className={`workout-tbody-row workout-tbody-row-${refCount.current = refCount.current + 1}`}>
        {/* <button className="workout-actions" formMethod="DELETE" name={`submit-individual`} value={workouts.id} aria-label={`delete button for ${workouts.exercise}`}>
          <img src={trash} alt="trash can to delete exercise" className="delete-action-img" />
        </button> */}

        <label htmlFor="displayDate"/>
        <input
          id="displayDate"
          name="displayDate"
          className="displayDate"
          placeholder=""
          type="hidden"
          value={formatCurrentDate(new Date(dateParam))}
        />

        <label htmlFor={`checkbox-${refCount.current}`}/>
        <input 
          type="checkbox"
          id={`checkbox-${refCount.current}`}
          name={`checkbox-${refCount.current}`}
          value={workouts.id}
          className="checkboxes"
        />

        <label htmlFor="exerciseId"/>
        <input
          id="exerciseId"
          className="exerciseId"
          name={`idInput_${refCount.current}`}
          placeholder=""
          type="hidden"
          value={workouts.id}
        />

        <label htmlFor={`workoutInput${refCount.current}`}/>
        <input
          className="exercise-row workout-rows"
          id={`workoutInput${refCount.current}`}
          name={`workoutInput${refCount.current}`} 
          defaultValue={workouts.exercise}
          aria-label={`Input name of ${workouts.exercise}`}
          readOnly
          autoFocus
        />

        <label htmlFor={`muscleGroupInput${refCount.current}`}/>
        <input
          className="focus-row workout-rows"
          id={`muscleGroupInput${refCount.current}`}
          name={`muscleGroupInput${refCount.current}`} 
          defaultValue={workouts.muscle_group}
          aria-label={`Input muscle group for ${workouts.exercise}`}
          readOnly
        />

        <label htmlFor={`setInput${refCount.current}`}/>
        <input
          className="sets-row workout-rows"
          id={`setInput${refCount.current}`}
          name={`setInput${refCount.current}`} 
          defaultValue={workouts.sets}
          aria-label={`Input sets for ${workouts.exercise}`}
          step="1"
          min="1"
          readOnly
        />

        <label htmlFor={`repInput${refCount.current}`}/>
        <input
          className="reps-row workout-rows"
          id={`repInput${refCount.current}`}
          name={`repInput${refCount.current}`} 
          defaultValue={workouts.reps}
          aria-label={`Input reps for ${workouts.exercise}`}
          step="1"
          min="1"
          readOnly
        />
      </div>
    )
  }) : null


  // Show no schedule or schedule depending on loaderData
  const showSchedule = todaysSchedule ? 
  <div id="schedule" className="schedule">
    <div className="table-actions">
      <button 
        className="threeDotImg" 
        onClick={handleDropDown} 
        aria-label="drop down menu with options for current schedule"
      >
        <div id="burger" className="threeDotImg-img">
          <li id="line1"></li>
          <li id="line2"></li>
          <li id="line3"></li>
        </div>
      </button>
      <button className="cancel-edit-button" onClick={handleEditCancel} aria-label="button to exit out of edit or delete form options">
        <img src={cancel} alt={`exit edit workout schedule button for ${formatCurrentDate(showDate)}`} className="cancel-edit-img" id="cancel-edit-img" />
      </button>
    </div>
    <div className="table-actions-menu">
      {plannedWorkout.length < 6 ? <button id="add-workout" onClick={newExerciseForm} type="button">Add</button> : null}
      <button className="action-edit" onClick={handleEditSchedule} type="button">Edit</button>
      <button className="action-delete" onClick={handleDeleteSchedule} type="button">Delete</button>
    </div>
    <div className="workout-table" role="table" aria-label={`Workouts planned for ${showDate}`}>
      <div className="workout-thead-section" role="rowgroup">
        <div className="workout-thead-row" role="row">
          <div className="th exercise"role="cell">Exercise</div>
          <div className="th focus"role="cell">Focus</div>
          <div className="th sets"role="cell">Sets</div>
          <div className="th reps"role="cell">Reps</div>
        </div>
      </div>
      <div className="workout-table-tbody">
        <Form method="PUT" className="edit-exercise-form" action={`/dashboard/:${usersUsername}`}>
          {todaysSchedule}
          <button id="submit-edit-exercise" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Edit"}
          </button>
          <button id="delete-all-exercises" type="submit" disabled={isSubmitting} formMethod="DELETE">
            {isSubmitting? "Deleting..." : "Delete All Workouts"}
          </button>
        </Form>
      </div>
    </div>
  </div> : null;


  // No schedule display and new exercise form button
  const noSchedule = plannedWorkout === null ?
  <div className="no-schedule" id="no-schedule">
    <h1>No workout schedule for today</h1>
    <button id="add-workout" onClick={newExerciseForm} type="button">Add Workout</button>
  </div>: null;


  // Create form for new workout
  function newExerciseForm(e) {
    const noScheduleContainer = document.getElementById("no-schedule");
    const showContainer = document.getElementById("workout-form");
    const addWorkoutButton = document.getElementById("add-workout");

    if(e.currentTarget) {
      if(noScheduleContainer) {
        noScheduleContainer.classList.toggle("inactive");
        showContainer.classList.toggle("active");
      } else {
        showContainer.classList.toggle("active");
        addWorkoutButton.classList.toggle("inactive")
      }
    }
  };
  

  // Cancel new exercise form
  function handleNewExerciseCancel(event) {
    // Document elements
    const showContainer = document.getElementById("workout-form");
    const noScheduleContainer = document.getElementById("no-schedule");
    const firstInputBoxes = document.getElementById("exercise-form");
    const firstInputBoxesContainers = firstInputBoxes.querySelectorAll(".inputBoxes");
    const firstInputBoxesChildren = firstInputBoxes.querySelectorAll("input");
    const scheduleContainer = document.getElementById("schedule");
    const addWorkoutButton = document.getElementById("add-workout");

    if(event) {
      if(showContainer && showContainer.classList.contains("active")) {
      showContainer.classList.toggle("active");
      }
      
      if(noScheduleContainer && noScheduleContainer.classList.contains("inactive") && !plannedWorkout) {
        noScheduleContainer.classList.toggle("inactive")
      }

      if(scheduleContainer) {
        addWorkoutButton.classList.toggle("inactive")
      }

      firstInputBoxesChildren.forEach((input) => {
        input.value = ""
      });
      
      firstInputBoxesContainers.forEach((child) => {
        if(child !== document.getElementById("inputBoxes1")) {
          firstInputBoxes.removeChild(child)
        }
      });

      setExerciseCount(() => 2)
    }
  }

  
  // Create new exercise inputs
  function newExercise() {

    const warningKey = document.getElementById("warning-key");

    if(exerciseCount > 6) {
     return warningKey.classList.add("inactive")
    } 
    
    if(plannedWorkout && (exerciseCount + plannedWorkout.length) > 6) {
      return warningKey.classList.add("inactive")
    }

    const prevWorkoutInput = document.getElementById(`workoutInput${exerciseCount - 1}`);
    const prevMuscleGroupInput = document.getElementById(`muscleGroupInput${exerciseCount - 1}`);
    const prevSetInput = document.getElementById(`setInput${exerciseCount - 1}`);
    const prevRepInput = document.getElementById(`repInput${exerciseCount - 1}`);
    
    if(!prevWorkoutInput.value) {
      return prevWorkoutInput.style.backgroundColor = "#d56d6a";
    } else {
      prevWorkoutInput.style.backgroundColor = "transparent";
    }

    if(!prevMuscleGroupInput.value) {
      return prevMuscleGroupInput.style.backgroundColor = "#d56d6a";
    } else {
      prevMuscleGroupInput.style.backgroundColor = "transparent";
    }
    
    if(!prevSetInput.value || isNaN(prevSetInput.value)) {
      return prevSetInput.style.backgroundColor = "#d56d6a";
    }else {
      prevSetInput.style.backgroundColor = "transparent";
    }

    if(!prevRepInput.value || isNaN(prevRepInput.value)) {
      return prevRepInput.style.backgroundColor = "#d56d6a";
    }else {
      prevRepInput.style.backgroundColor = "transparent";
    }

    // Creating new inputs for exercise form
    if(document.getElementById(`workoutInput${exerciseCount - 1}`).value && 
    document.getElementById(`muscleGroupInput${exerciseCount - 1}`).value &&
    document.getElementById(`setInput${exerciseCount - 1}`).value &&
    document.getElementById(`repInput${exerciseCount - 1}`).value) {
      
      if(exerciseCount <= 6) {
        warningKey.classList.remove("inactive")
      } 
    
      if(plannedWorkout || plannedWorkout && (exerciseCount + plannedWorkout.length) < 6) {
        warningKey.classList.remove("inactive")
      }

      prevWorkoutInput.style.backgroundColor = "transparent";
      prevMuscleGroupInput.style.backgroundColor = "transparent";
      prevSetInput.style.backgroundColor = "transparent";
      prevRepInput.style.backgroundColor = "transparent";
    
      // Chaging state of exercise count
      setExerciseCount(prevCount => prevCount + 1);
      

      // Previous input box
      const prevInputBox = document.getElementById(`inputBoxes${exerciseCount - 1}`)
      
      // create div
      const inputBoxes = document.createElement("div");
      inputBoxes.setAttribute("class", "inputBoxes");
      inputBoxes.setAttribute("id", `inputBoxes${exerciseCount}`);
      
      /* Create labels and inputs */ 

      // Workout input
      const newExerciseLabel = document.createElement("label");
      newExerciseLabel.setAttribute("for", `workoutInput${exerciseCount}`);
      
      const newExerciseInput = document.createElement("input");
      newExerciseInput.setAttribute("class", "workoutInput");
      newExerciseInput.setAttribute("id", `workoutInput${exerciseCount}`);
      newExerciseInput.setAttribute("name", `workoutInput${exerciseCount}`);
      newExerciseInput.setAttribute("placeholder", "Workout");
      newExerciseInput.setAttribute("aria-label", `Input name of exercise number ${exerciseCount}`);
      
      // Muscle Group input
      const newMuscleGroupLabel = document.createElement("label");
      newMuscleGroupLabel.setAttribute("for", `muscleGroupInput${exerciseCount}`);
      
      const newMuscleGroupInput = document.createElement("input");
      newMuscleGroupInput.setAttribute("class", "muscleGroupInput");
      newMuscleGroupInput.setAttribute("id", `muscleGroupInput${exerciseCount}`);
      newMuscleGroupInput.setAttribute("name", `muscleGroupInput${exerciseCount}`);
      newMuscleGroupInput.setAttribute("placeholder", "Focus");
      newMuscleGroupInput.setAttribute("aria-label", `Input muscle group for exercise number ${exerciseCount}`);
      
      // Sets input
      const newSetLabel = document.createElement("label");
      newSetLabel.setAttribute("for", `setInput${exerciseCount}` );
      
      const newSetInput = document.createElement("input");
      newSetInput.setAttribute("class", "setInput");
      newSetInput.setAttribute("id", `setInput${exerciseCount}`);
      newSetInput.setAttribute("name", `setInput${exerciseCount}`);
      newSetInput.setAttribute("placeholder", "Sets");
      newExerciseInput.setAttribute("aria-label", `Input sets for exercise number ${exerciseCount}`);

      // Reps input
      const newRepLabel = document.createElement("label");
      newRepLabel.setAttribute("for", `repInput${exerciseCount}` );
      
      const newRepInput = document.createElement("input");
      newRepInput.setAttribute("class", "repInput");
      newRepInput.setAttribute("id", `repInput${exerciseCount}`);
      newRepInput.setAttribute("name", `repInput${exerciseCount}`);
      newRepInput.setAttribute("placeholder", "Reps");
      newExerciseInput.setAttribute("aria-label", `Input reps for exercise number ${exerciseCount}`);

      // append child nodes
      inputBoxes.appendChild(newExerciseLabel);
      inputBoxes.appendChild(newExerciseInput);
      inputBoxes.appendChild(newMuscleGroupLabel);
      inputBoxes.appendChild(newMuscleGroupInput);
      inputBoxes.appendChild(newSetLabel);
      inputBoxes.appendChild(newSetInput);
      inputBoxes.appendChild(newRepLabel);
      inputBoxes.appendChild(newRepInput);
      
      // append div
      prevInputBox.after(inputBoxes)

    }
  }

  // Remove latest new exercise input
  function removeExercise() {
    const firstInputBox = document.getElementById(`inputBoxes1`);
    const lastInputBox = document.getElementById(`inputBoxes${exerciseCount - 1}`);
    if(lastInputBox != firstInputBox) {
      lastInputBox.remove();
      setExerciseCount(prevCount => prevCount - 1)
    };
  }


  // Toggle schedule and edit form
  function handleEditSchedule(event) {
    const pastDateButton = document.getElementById("past-date");
    const futureDateButton = document.getElementById("future-date");
    const editWorkoutRows = document.querySelector("input.workout-rows");
    const editAllWorkoutRows = document.querySelectorAll("input.workout-rows");
    const formFocus = document.querySelectorAll("input.workout-rows");
    const cancelEditButton = document.querySelector("button.cancel-edit-button");
    const threeDotButton = document.querySelector("button.threeDotImg");
    const actionsMenu = document.querySelector("div.table-actions-menu")
    const submitEdit = document.getElementById("submit-edit-exercise");
    const addWorkoutForm = document.getElementById("workout-form");
    const addWorkoutButton = document.getElementById("add-workout");

    if(event) {
      // Hide display date buttons
      pastDateButton.classList.toggle("inactive");
      futureDateButton.classList.toggle("inactive");

      // Make Form editable
      editAllWorkoutRows.forEach((inputRow) => {
        inputRow.removeAttribute("readonly");
      });

      // Change Form apperance
      editWorkoutRows.classList.add("active-edit");
      
      // Allow inputs to use focus
      formFocus.forEach((inputElement) => {
        inputElement.classList.add("active-edit");
      })

      // Hide add workout button
      if(addWorkoutButton) {
        addWorkoutButton.classList.add("inactive");
      }

      // Hide add workout form if visible
      if(addWorkoutForm && addWorkoutForm.classList.contains("active")) {
        addWorkoutForm.classList.remove("active")
      }
      
      // Hide menu button
      threeDotButton.classList.add("inactive");

      // Show cancel, hide actions menu, show edit workout submit button 
      cancelEditButton.classList.add("active");
      actionsMenu.classList.remove("active");
      submitEdit.classList.add("active");
    }
  }

  function handleEditCancel(event) {
    if(event) {
      window.location.reload();
    }
  }

  // Handles deleting workouts from schedule
  function handleDeleteSchedule(event) {
    const pastDateButton = document.getElementById("past-date");
    const futureDateButton = document.getElementById("future-date");
    const formFocus = document.querySelectorAll("input.workout-rows");
    const cancelEditButton = document.querySelector("button.cancel-edit-button");
    const threeDotButton = document.querySelector("button.threeDotImg");
    const actionsMenu = document.querySelector("div.table-actions-menu")
    const submitDelete= document.getElementById("delete-all-exercises");
    const addWorkoutForm = document.getElementById("workout-form");
    const addWorkoutButton = document.getElementById("add-workout");
    const slideDelete = document.querySelectorAll("div.workout-tbody-row");

    if(event) {

      pastDateButton.classList.toggle("inactive");
      futureDateButton.classList.toggle("inactive");
      
      // Allow inputs to use focus
      formFocus.forEach((inputElement) => {
        inputElement.classList.add("active-delete");
      })

      // Hide add workout button
      if(addWorkoutButton) {
        addWorkoutButton.classList.add("inactive");
      }

      // Hide add workout form if visible
      if(addWorkoutForm && addWorkoutForm.classList.contains("active")) {
        addWorkoutForm.classList.remove("active")
      }

      //Hide menu button
      threeDotButton.classList.add("inactive");

      // Show cancel, hide actions menu, show delete workout submit button 
      cancelEditButton.classList.add("active");
      actionsMenu.classList.remove("active");
      submitDelete.classList.add("active");
      
      // Display individual delete buttons
      slideDelete.forEach((button) => {
        button.classList.add("delete")
      })
    }
  }

  // Handle drop down calendar
  function handleCalendar(event) {
    const displayCal = document.getElementById("calendar-container");
    const actionsMenu = document.querySelector("div.table-actions-menu");

    if(event) {
      displayCal.classList.toggle("active");
      if(actionsMenu && actionsMenu.classList.contains("active")) {
        actionsMenu.classList.remove("active");
      }
    }
  }


  // Check screen size and remove elements based on screen size
  function checkScreenSize() {
    const windowWidth = window.innerWidth;
    const displayCal = document.getElementById("calendar-container");
    const calendarButton = document.querySelector(".calendar-button");
    const scroll = document.querySelector(".all-scheduling");

    if(windowWidth < 1080) {
      if(calendarButton) {
        calendarButton.disabled = false;
      }
    }

    if(windowWidth > 1079) {
      if(displayCal && displayCal.classList.contains("active")) {
        displayCal.classList.remove("active");
      }

      if(calendarButton) {
        calendarButton.disabled = true;
      }

      if(scroll) {
        scroll.scrollTop = 0;
      }
    }
  }

  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);

  return(
    <>
      <div className="container dash-container">
        <div className="displayDate">
          <button id="past-date" onClick={() => prevDate()}>
            <img src={leftArr} alt="left button arrow to change date to day before" aria-roledescription="button"/>
          </button>

          <button className="calendar-button" onClick={handleCalendar}>
            <span aria-label="date">{formatCurrentDate(showDate, "none")}</span>
            <img src={calendar} alt="button to drop down calendar" aria-roledescription="button"/>
          </button>

          <button id="future-date" onClick={() => nextDate()}>
            <img src={rightArr} alt="right button arrow to change date to day after" aria-roledescription="button"/>
          </button>
        </div>
        <div className="all-scheduling">
          <div id="workout-form" className="workout-form">
            <div className="cancel-new-exercise">
              <img src={cancel} alt={`Exit new exercise form for ${formatCurrentDate(showDate)}`} className="cancel-new-exercise-img" onClick={handleNewExerciseCancel} aria-roledescription="button"/>
            </div>
            <h1>Add Workouts</h1>
            <Form method="post" id="exercise-form">
              <div className="inputBoxes" id="inputBoxes1">
                <label htmlFor="displayDate"/>
                <input id="displayDate" className="displayDate" 
                  name="displayDate" 
                  placeholder="" 
                  type="hidden" 
                  value={formatCurrentDate(showDate)}
                  />

                <label htmlFor="workoutInput1"></label>
                <input 
                  className="workoutInput" 
                  id="workoutInput1" 
                  name="workoutInput1" 
                  placeholder="Workout" 
                  aria-label="Input name of exercise number one"
                />

                <label htmlFor="muscleGroupInput1"></label>
                <input className="muscleGroupInput" 
                  id="muscleGroupInput1" 
                  name="muscleGroupInput1" 
                  placeholder="Focus"
                  aria-label="Input muscle group for exercise number one"
                />

                <label htmlFor="setInput1"></label>
                <input className="setInput"
                  type="number" 
                  id="setInput1" 
                  name="setInput1" 
                  placeholder="Sets" 
                  aria-label="Input sets for exercise number one"
                  step="1"
                  min="1"
                />

                <label htmlFor="repInput1"></label>
                <input className="repInput"
                  type="number" 
                  id="repInput1" 
                  name="repInput1" 
                  placeholder="Reps" 
                  aria-label="Input reps for exercise number one"
                  step="1"
                  min="1"
                />
              </div>
              <div className="exercise-btn-container">
                <div id="add-exercise" onClick={newExercise} aria-label="add new exercise input">
                  <img src={plusIcon} alt="plus sign" />
                  Add
                </div>
                <div id="remove-exercise" onClick={removeExercise} aria-label="remove previsouly added exercise input">
                  <img src={minusIcon} alt="minus sign" />
                  Remove
                </div>
              </div>
              <span id="warning-key" aria-label="workout limit message">Daily Limit: 6 workouts</span>
              {actionData && key.startsWith("invalid") ? <span className="invalidDash" aria-label={actionData[key]}>{actionData[key]}</span> : null}
              <button id="submit-exercise" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </Form>
          </div>

          {noSchedule}
          {showSchedule}
          
        </div>
        <Calendar allDates={allUserDates} />
      </div>
    </>
  )
}