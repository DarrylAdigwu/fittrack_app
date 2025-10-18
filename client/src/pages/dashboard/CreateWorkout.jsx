import React from "react";
import { Form } from "react-router";
import minusIcon from "../../assets/images/minusIcon.svg";
import plusIcon from "../../assets/images/plusIcon.svg";
import cancel from "../../assets/images/cancel.svg";
import { formatCurrentDate } from "../../../client-utils";

export default function CreateWorkout(props) {

  // Display for no schedule workout
  const noSchedule = props.plannedWorkout === null ?
  <div className="no-schedule" id="no-schedule">
    <h1>No workout schedule for today</h1>
    <button id="add-workout" onClick={props.newExerciseForm} type="button">Add Workout</button>
  </div> : null;

  // Create inputs for add workouts form
  function newExercise() {
    // Exercise limit warning key for more than 6 workouts
    const warningKey = document.getElementById("warning-key");

    if(props.exerciseCount > 6) {
     return warningKey.classList.add("inactive")
    } 
    
    if(props.plannedWorkout && (props.exerciseCount + props.plannedWorkout.length) > 6) {
      return warningKey.classList.add("inactive")
    }

        // Get previous input elements and check if they have inputs, give warning if no input
    const prevWorkoutInput = document.getElementById(`workoutInput${props.exerciseCount - 1}`);
    const prevMuscleGroupInput = document.getElementById(`muscleGroupInput${props.exerciseCount - 1}`);
    
    if(!prevWorkoutInput.value) {
      return prevWorkoutInput.style.backgroundColor = "#d56d6a";
    } else {
      prevWorkoutInput.style.backgroundColor = "transparent";
    };

    if(!prevMuscleGroupInput.value) {
      return prevMuscleGroupInput.style.backgroundColor = "#d56d6a";
    } else {
      prevMuscleGroupInput.style.backgroundColor = "transparent";
    };

    // Creating new inputs for exercise form
    if(document.getElementById(`workoutInput${props.exerciseCount - 1}`).value && 
    document.getElementById(`muscleGroupInput${props.exerciseCount - 1}`).value) {
      
      // Remove warnings if exercise count is less than 7
      if(props.exerciseCount < 7) {
        warningKey.classList.remove("inactive")
      } 
      
      if(props.plannedWorkout || props.plannedWorkout && (props.exerciseCount + props.plannedWorkout.length) <= 6) {
        warningKey.classList.remove("inactive")
      }

      prevWorkoutInput.style.backgroundColor = "transparent";
      prevMuscleGroupInput.style.backgroundColor = "transparent";
    
      // Add 1 to exercise count state
      props.setExerciseCount(prevCount => prevCount + 1);
      
      // Get previous input box
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

      // append child nodes
      inputBoxes.appendChild(newExerciseLabel);
      inputBoxes.appendChild(newExerciseInput);
      inputBoxes.appendChild(newMuscleGroupLabel);
      inputBoxes.appendChild(newMuscleGroupInput);
      
      // append div
      prevInputBox.after(inputBoxes);
    }
  };

  // Remove latest new exercise input
  function removeExercise() {
    // Get first exercise input element
    const firstInputBox = document.getElementById(`inputBoxes1`);
    // Get last exercise input eleemnt
    const lastInputBox = document.getElementById(`inputBoxes${props.exerciseCount - 1}`);
    // Remove last input box if it's not the first input box
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
      // Toggle the display of the workout form
      if(showContainer && showContainer.classList.contains("active")) {
      showContainer.classList.remove("active");
      }

      // Display no schedule container and add workout button
      if(noScheduleContainer && 
        noScheduleContainer.classList.contains("inactive") &&
        !props.plannedWorkout) {
          noScheduleContainer.classList.remove("inactive")
      }

      if(scheduleContainer) {
        addWorkoutButton.classList.remove("inactive")
      }

      // Remove values from all inputs that won't be submitted
      firstInputBoxesChildren.forEach((input) => {
        input.value = ""
      });
      
      // Remove all input rows that are not the first 
      firstInputBoxesContainers.forEach((child) => {
        if(child !== document.getElementById("inputBoxes1")) {
          firstInputBoxes.removeChild(child)
        }
      });

      // Reset exercise count
      props.setExerciseCount(() => 2)
    }
  };

  return(
    <>
      {/* Container for no scheduled workouts */}
      {noSchedule}
      {/* Container for creating exercises form */}
      <div id="workout-form" className="workout-form">
        {/* Button to cancel exercise form */}
        <div className="cancel-new-exercise">
          <img 
            src={cancel} 
            alt={`Exit new exercise form for ${formatCurrentDate(props.showDate)}`} 
            className="cancel-new-exercise-img" 
            onClick={handleNewExerciseCancel} 
            aria-roledescription="button"
          />
        </div>
        {/* Form to add exercises */}
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

          </div>
          {/* Container for add and remove buttons */}
          <div className="exercise-btn-container">
            {/* Add button */}
            <div 
              id="add-exercise" 
              onClick={newExercise} 
              aria-label="add new exercise input"
            >
              <img src={plusIcon} alt="plus sign" />
              Add
            </div>
            {/* Remove button */}
            <div 
              id="remove-exercise" 
              onClick={removeExercise} 
              aria-label="remove previously exercise input"
            >
              <img src={minusIcon} alt="minus sign" />
              Remove
            </div>
          </div>
          {/* Warning key for exercise limit */}
          <span id="warning-key" aria-label="workout limit message">Daily Limit Hit: 6 workouts</span>
          {/* Error key for submitting invalid inputs */}
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
          {/* Submit exercise button */}
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