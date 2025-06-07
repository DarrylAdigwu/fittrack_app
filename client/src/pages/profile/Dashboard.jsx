import React from "react";
import { Form, useActionData, useLoaderData, useSearchParams } from "react-router";
import "../../assets/css/dashboard.css";
import plusIcon from "../../assets/images/plusIcon.svg";
import minusIcon from "../../assets/images/minusIcon.svg";
import threeDot from "../../assets/images/three-dot-menu.svg";
import trash from "../../assets/images/trash.svg";
import cancel from "../../assets/images/cancel.svg";
import {sendUserData, getTodaysWorkout, formatCurrentDate, usersUsername} from "../../../client-utils";


export async function loader({ request }) {
  
}

export async function action({ request }) {
  const formData = await request.formData();
  const allData = Object.fromEntries(formData);
  console.log(allData)
  // Send Data to server
  const sendFormData = await sendUserData(`dashboard/${usersUsername}`, allData);

  if(sendFormData.serverError) {
    return sendFormData.serverError;
  }

  if(sendFormData.serverCheck.valid) {
    return window.location.reload();
  }
}

export default function Dashboard() {
  const dashLoader = useLoaderData();
  const actionData = useActionData();
  const [exerciseCount, setExerciseCount] = React.useState(2);
  const [searchParams, setSearchParams] = useSearchParams(`?date=${new Date()}`);
  const [showDate, setShowDate] = React.useState();
  const [plannedWorkout, setPlannedWorkout] = React.useState();
  const [isLoading, setIsLoading] = React.useState(false);

  // Get value for date search param state
  const dateParam = searchParams.get("date");

  // Get key and make it string if error in form 
  let key = actionData ? Object.keys(actionData).toString() : null;


  // Display previous date
  function prevDate() {
    // Document elements
    const showContainer = document.getElementById("workout-form");
    const hideNoScheduleContainer = document.getElementById("no-schedule");
    const scheduleContainer = document.getElementById("schedule");
    const plannedSchedule = document.getElementById("schedule");
    const editScheduleForm = document.getElementById("edit-exercise-form-section");

    if(scheduleContainer && scheduleContainer.style.display === "flex" && plannedWorkout === null) {
      scheduleContainer.style.display = "none";
    }
    if(showContainer && showContainer.style.display === "flex") {
      showContainer.style.display = "none";
    }
    if(!plannedWorkout) {
      hideNoScheduleContainer.style.display = "flex"
    } 
    if(editScheduleForm.classList.contains("active")) {
      plannedSchedule.classList.toggle("active");
      editScheduleForm.classList.toggle("active");
    }

    setSearchParams((prev) => {
      const prevParam = new Date(prev.get("date"));
      const prevDate = prevParam.setDate(prevParam.getDate() - 1);
      return { "date": formatCurrentDate(prevDate)}
    });
  };

  // Display next date
  function nextDate() {
    // Document elements
    const showContainer = document.getElementById("workout-form");
    const hideNoScheduleContainer = document.getElementById("no-schedule");
    const scheduleContainer = document.getElementById("schedule");
    const plannedSchedule = document.getElementById("schedule");
    const editScheduleForm = document.getElementById("edit-exercise-form-section");

    if(scheduleContainer && scheduleContainer.style.display === "flex" && plannedWorkout === null) {
      scheduleContainer.style.display = "none";
    }
    if(showContainer && showContainer.style.display === "flex") {
      showContainer.style.display = "none";
    }
    if(!plannedWorkout) {
      hideNoScheduleContainer.style.display = "flex"
    } 
    if(editScheduleForm.classList.contains("active")) {
      plannedSchedule.classList.toggle("active");
      editScheduleForm.classList.toggle("active");
    }

    setSearchParams((prev) => {
      const nextParam = new Date(prev.get("date"));
      const nextDate = nextParam.setDate(nextParam.getDate() + 1);
      return { "date": formatCurrentDate(nextDate)}
    });
  };


  // Set date based on search params
  React.useEffect(() => {
      if(dateParam) {
        try {
          const paramDate = new Date(dateParam);
          if(!isNaN(paramDate)) {
            setShowDate(paramDate)
            setSearchParams({ date: formatCurrentDate(paramDate)})
          }
        } catch(err) {
          console.error("Error parsing date", err)
        }
      } 
  }, [dateParam])


  // Load for current date using search params
  React.useEffect(() => {
    async function loadTodaysWorkout() {
      try {
        const getExercise = await getTodaysWorkout(formatCurrentDate(new Date(dateParam)));
        setPlannedWorkout(getExercise.getWorkout)
      } catch(err) {
        console.error("Load current date workout error:", err)
      }
    }
    loadTodaysWorkout()
  }, [dateParam]);


  // Toggle drop down nav
  function handleDropDown(event) {
    const threeDotImage = document.querySelector("img.threeDotImg");
    const actionsMenu = document.querySelector("div.table-actions-menu")
    
    if(event) {
      threeDotImage.classList.toggle("active");
      actionsMenu.classList.toggle("active");
    }
  }


  // Display table for planned workout
  const todaysSchedule = plannedWorkout ? 
  plannedWorkout.map((workouts) => {
    return (                                                                                                                                                                    
      <tr key={workouts.id} className={`workout-tbody-row workout-tbody-row-${workouts.id}`}>
        <td className="exercise-row">{workouts.exercise}</td>
        <td className="focus-row">{workouts.muscle_group}</td>
        <td className="sets-row">{workouts.sets}</td>
        <td className="reps-row">{workouts.reps}</td>
        <td className="workout-actions">
          <img src={trash} alt="trash can to delete exercise" className="delete-action" />
        </td>
      </tr>
    )
  }) : null


  // Show no schedule or schedule depending on loaderData
  const showSchedule = todaysSchedule ? 
  <div id="schedule" className="schedule">
    <div className="table-actions">
      <img className="threeDotImg" src={threeDot} alt="menu to edit table" onClick={handleDropDown}/>
    </div>
    <div className="table-actions-menu">
      <span className="action-edit" onClick={handleEditSchedule}>Edit</span>
      <span className="action-delete">Delete</span>
    </div>
    <table className="workout-table">
      <thead className="workout-thead-section">
        <tr className="workout-thead-row">
          <th className="exercise">Exercise</th>
          <th className="focus">Focus</th>
          <th className="sets">Sets</th>
          <th className="reps">Reps</th>
        </tr>
      </thead>
      <tbody className="workout-table-tbody">
        {todaysSchedule}
      </tbody>
    </table>
  </div> :
  <div className="no-schedule" id="no-schedule">
    <h1>No workout schedule for today</h1>
    <button id="add-workout" onClick={newForm} type="button">Add workout</button>
  </div>;


  // Create form for new workout
  function newForm(e) {
    const hideNoScheduleContainer = document.getElementById("no-schedule");
    const showContainer = document.getElementById("workout-form");

    if(e.currentTarget) {
      hideNoScheduleContainer.style.display = "none";
      showContainer.style.display = "flex";
    }
  }


  // Create new exercise inputs
  function newExercise() {
    if(exerciseCount > 6) {
      return "max";
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
      //inputBoxes.appendChild(removeButton)
      
      // append div
      prevInputBox.after(inputBoxes)

    }
  }

  function removeExercise() {
    const firstInputBox = document.getElementById(`inputBoxes1`);
    const lastInputBox = document.getElementById(`inputBoxes${exerciseCount - 1}`);
    if(lastInputBox != firstInputBox) {
      lastInputBox.remove();
      setExerciseCount(prevCount => prevCount - 1)
    };
  }

  // Edit schedule option
  const editSchedule = plannedWorkout && 
  plannedWorkout.map((workout) => {
    return(
      <div className="inputBoxes" id="edit-exercise-form">
        <div className="inputBoxes" id="editInputBoxes1">
          <label htmlFor="displayDate"/>
          <input id="displayDate" className="displayDate" 
            name="displayDate" 
            placeholder="" 
            type="hidden" 
            value={formatCurrentDate(new Date(`${workout.date}`))}
          />

          <label htmlFor="workoutInput1"></label>
          <input 
            className="workoutInput" 
            id="workoutInput1" 
            name="workoutInput1" 
            defaultValue={`${workout.exercise}`}
            placeholder="Workout" 
            aria-label="Input name of exercise number one"
            autoFocus
          />

          <label htmlFor="muscleGroupInput1"></label>
          <input className="muscleGroupInput" 
            id="muscleGroupInput1" 
            name="muscleGroupInput1"
            defaultValue={`${workout.muscle_group}`} 
            placeholder="Focus"
            aria-label="Input muscle group for exercise number one"
          />

          <label htmlFor="setInput1"></label>
          <input className="setInput"
            type="number" 
            id="setInput1" 
            name="setInput1" 
            defaultValue={`${workout.sets}`}
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
            defaultValue={`${workout.reps}`}
            placeholder="Reps" 
            aria-label="Input reps for exercise number one"
            step="1"
            min="1"
          />
        </div>
      </div>
    )
  });


  // Toggle schedule and edit form
  function handleEditSchedule(event) {
    const editScheduleButton = document.querySelector("action-edit");
    const plannedSchedule = document.getElementById("schedule");
    const editScheduleForm = document.getElementById("edit-exercise-form-section");
    if(event) {
      plannedSchedule.classList.toggle("active");
      editScheduleForm.classList.toggle("active");
    }
  }

  function handleEditCancel(event) {
    const plannedSchedule = document.getElementById("schedule");
    const editScheduleForm = document.getElementById("edit-exercise-form-section");
    if(event) {
      plannedSchedule.classList.toggle("active");
      editScheduleForm.classList.toggle("active");
    }
  }

  return(
    <div className="container dash-container">
      <div className="displayDate">
        <button id="past-date" onClick={() => prevDate()}>&lt;</button>
          <span>{formatCurrentDate(showDate)}</span>
        <button id="future-date" onClick={() => nextDate()}>&gt;</button>
      </div>
      {showSchedule}
      <div className="edit-exercise-form-section" id="edit-exercise-form-section">
        <div className="cancel-edit">
          <img src={cancel} alt="cancel edit" className="cancel-edit-img" onClick={handleEditCancel} />
        </div>
        <Form method="PATCH" className="edit-exercise-form">
          {editSchedule}
          {actionData && key.startsWith("invalid") ? <span className="invalidDash">{actionData[key]}</span> : null}
          <button id="submit-edit-exercise" type="submit">{isLoading ? "Submitting..." : "Edit Workout"}</button>
        </Form>
      </div>
      <div id="workout-form" className="workout-form">
        <h1>Create a Workout</h1>
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
            <div id="add-exercise" onClick={newExercise} aria-label="add exercise input">
              <img src={plusIcon} alt="plus sign" />
              Add
            </div>
            <div id="remove-exercise" onClick={removeExercise} aria-label="remove exercise input">
              <img src={minusIcon} alt="minus sign" />
              Remove
            </div>
          </div>
          {actionData && key.startsWith("invalid") ? <span className="invalidDash">{actionData[key]}</span> : null}
          <button id="submit-exercise" type="submit">{isLoading ? "Submitting..." : "Submit"}</button>
        </Form>
      </div>
    </div>
  )
}