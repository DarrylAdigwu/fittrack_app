import React from "react";
import { Form } from "react-router";
import minusIcon from "../../assets/images/minusIcon.svg";
import plusIcon from "../../assets/images/plusIcon.svg";
import cancel from "../../assets/images/cancel.svg";
import { formatCurrentDate } from "../../../client-utils";

export default function CreateWorkout(props) {

  // Display for days without scheduled workouts
  const noSchedule = props.plannedWorkout === null ?
  <div className="no-schedule" id="no-schedule">
    <h1>No workout schedule for today</h1>
    <button id="add-workout" onClick={props.newExerciseForm} type="button">Add Workout</button>
  </div> : null;

  // Create inputs for add workouts form
  function newExercise() {
    const warningKey = document.getElementById("warning-key");

    if(props.exerciseCount > 6) {
     return warningKey.classList.add("inactive")
    } 
    
    if(props.plannedWorkout && (props.exerciseCount + props.plannedWorkout.length) > 6) {
      return warningKey.classList.add("inactive")
    }

    const prevWorkoutInput = document.getElementById(`workoutInput${props.exerciseCount - 1}`);
    const prevMuscleGroupInput = document.getElementById(`muscleGroupInput${props.exerciseCount - 1}`);
    const prevSetInput = document.getElementById(`setInput${props.exerciseCount - 1}`);
    const prevRepInput = document.getElementById(`repInput${props.exerciseCount - 1}`);
    
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
    if(document.getElementById(`workoutInput${props.exerciseCount - 1}`).value && 
    document.getElementById(`muscleGroupInput${props.exerciseCount - 1}`).value &&
    document.getElementById(`setInput${props.exerciseCount - 1}`).value &&
    document.getElementById(`repInput${props.exerciseCount - 1}`).value) {
      
      if(props.exerciseCount <= 6) {
        warningKey.classList.remove("inactive")
      } 
      
      if(props.plannedWorkout || props.plannedWorkout && (props.exerciseCount + props.plannedWorkout.length) <= 6) {
        warningKey.classList.remove("inactive")
      }

      prevWorkoutInput.style.backgroundColor = "transparent";
      prevMuscleGroupInput.style.backgroundColor = "transparent";
      prevSetInput.style.backgroundColor = "transparent";
      prevRepInput.style.backgroundColor = "transparent";
    
      // Chaging state of exercise count
      props.setExerciseCount(prevCount => prevCount + 1);

      // Previous input box
      const prevInputBox = document.getElementById(`inputBoxes${props.exerciseCount - 1}`)
      
      // create div
      const inputBoxes = document.createElement("div");
      inputBoxes.setAttribute("class", "inputBoxes");
      inputBoxes.setAttribute("id", `inputBoxes${props.exerciseCount}`);
      
      /* Create labels and inputs */ 

      // Workout input
      const newExerciseLabel = document.createElement("label");
      newExerciseLabel.setAttribute("for", `workoutInput${props.exerciseCount}`);
      
      const newExerciseInput = document.createElement("input");
      newExerciseInput.setAttribute("class", "workoutInput");
      newExerciseInput.setAttribute("id", `workoutInput${props.exerciseCount}`);
      newExerciseInput.setAttribute("name", `workoutInput${props.exerciseCount}`);
      newExerciseInput.setAttribute("placeholder", "Workout");
      newExerciseInput.setAttribute("aria-label", `Input name of exercise number ${props.exerciseCount}`);
      
      // Muscle Group input
      const newMuscleGroupLabel = document.createElement("label");
      newMuscleGroupLabel.setAttribute("for", `muscleGroupInput${props.exerciseCount}`);
      
      const newMuscleGroupInput = document.createElement("input");
      newMuscleGroupInput.setAttribute("class", "muscleGroupInput");
      newMuscleGroupInput.setAttribute("id", `muscleGroupInput${props.exerciseCount}`);
      newMuscleGroupInput.setAttribute("name", `muscleGroupInput${props.exerciseCount}`);
      newMuscleGroupInput.setAttribute("placeholder", "Focus");
      newMuscleGroupInput.setAttribute("aria-label", `Input muscle group for exercise number ${props.exerciseCount}`);
      
      // Sets input
      const newSetLabel = document.createElement("label");
      newSetLabel.setAttribute("for", `setInput${props.exerciseCount}` );
      
      const newSetInput = document.createElement("input");
      newSetInput.setAttribute("class", "setInput");
      newSetInput.setAttribute("id", `setInput${props.exerciseCount}`);
      newSetInput.setAttribute("name", `setInput${props.exerciseCount}`);
      newSetInput.setAttribute("placeholder", "Sets");
      newExerciseInput.setAttribute("aria-label", `Input sets for exercise number ${props.exerciseCount}`);

      // Reps input
      const newRepLabel = document.createElement("label");
      newRepLabel.setAttribute("for", `repInput${props.exerciseCount}` );
      
      const newRepInput = document.createElement("input");
      newRepInput.setAttribute("class", "repInput");
      newRepInput.setAttribute("id", `repInput${props.exerciseCount}`);
      newRepInput.setAttribute("name", `repInput${props.exerciseCount}`);
      newRepInput.setAttribute("placeholder", "Reps");
      newExerciseInput.setAttribute("aria-label", `Input reps for exercise number ${props.exerciseCount}`);

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
      prevInputBox.after(inputBoxes);
    }
  };

  // Remove latest new exercise input
  function removeExercise() {
    const firstInputBox = document.getElementById(`inputBoxes1`);
    const lastInputBox = document.getElementById(`inputBoxes${props.exerciseCount - 1}`);
    if(lastInputBox != firstInputBox) {
      lastInputBox.remove();
      props.setExerciseCount(prevCount => prevCount - 1)
    };
  };

  // Cancel new exercise form (using state logic)
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

      if(noScheduleContainer && 
      noScheduleContainer.classList.contains("inactive") && 
      !props.plannedWorkout) 
      {
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

      props.setExerciseCount(() => 2)
    }
  };


  return(
    <>
      {noSchedule}
      <div id="workout-form" className="workout-form">
        <div className="cancel-new-exercise">
          <img 
            src={cancel} 
            alt={`Exit new exercise form for ${formatCurrentDate(props.showDate)}`} 
            className="cancel-new-exercise-img" 
            onClick={handleNewExerciseCancel} 
            aria-roledescription="button"
          />
        </div>
        <h1>Add Workouts</h1>
        <Form method="POST" id="exercise-form">
          <div className="inputBoxes" id="inputBoxes1">
            <label htmlFor="displayDate"/>
            <input id="displayDate" className="displayDate" 
              name="displayDate" 
              placeholder="" 
              type="hidden" 
              value={formatCurrentDate(props.showDate)}
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
            <div 
              id="add-exercise" 
              onClick={newExercise} 
              aria-label="add new exercise input"
            >
              <img src={plusIcon} alt="plus sign" />
              Add
            </div>
            <div 
              id="remove-exercise" 
              onClick={removeExercise} 
              aria-label="remove previously exercise input"
            >
              <img src={minusIcon} alt="minus sign" />
              Remove
            </div>
          </div>
          <span id="warning-key" aria-label="workout limit message">Daily Limit Hit: 6 workouts</span>
          {
            props.actionData && props.errorKey.startsWith("invalid") ? 
            <span 
              className="invalidDash" 
              aria-label={props.actionData[props.errorKey]}
            >
              {props.actionData[props.errorKey]}
            </span> 
            : null
          }
          <button 
            id="submit-exercise" 
            type="submit" 
            disabled={props.isSubmitting}
          >
            {props.isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </Form>
      </div>
    </>
  )
}