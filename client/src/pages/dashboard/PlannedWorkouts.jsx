import React from "react";
import { Form } from "react-router";
import cancel from "../../assets/images/cancel.svg";
import { formatCurrentDate, usersUsername } from "../../../client-utils";

export default function PlannedWorkouts(props) {

  // Toggle drop down nav
  function handleDropDown(event) {
    const threeDotButton = document.querySelector("button.threeDotImg");
    const actionsMenu = document.querySelector("div.table-actions-menu")
    
    if(event) {
      threeDotButton.classList.toggle("active");
      actionsMenu.classList.toggle("active");
    }
  }

  // Display form for planned workout
  const todaysSchedule = props.plannedWorkout ? 
  props.plannedWorkout.map((workouts) => {
    return (          
      <div key={workouts.id} className={`workout-tbody-row workout-tbody-row-${props.refCount.current = props.refCount.current + 1}`}>
        <label htmlFor="displayDate"/>
        <input
          id="displayDate"
          name="displayDate"
          className="displayDate"
          placeholder=""
          type="hidden"
          value={formatCurrentDate(new Date(props.dateParam))}
        />

        <label htmlFor={`checkbox-${props.refCount.current}`}/>
        <input 
          type="checkbox"
          id={`checkbox-${props.refCount.current}`}
          name={`checkbox-${props.refCount.current}`}
          value={workouts.id}
          className="checkboxes"
        />

        <label htmlFor="exerciseId"/>
        <input
          id="exerciseId"
          className="exerciseId"
          name={`idInput_${props.refCount.current}`}
          placeholder=""
          type="hidden"
          value={workouts.id}
        />

        <label htmlFor={`workoutInput${props.refCount.current}`}/>
        <input
          className="exercise-row workout-rows"
          id={`workoutInput${props.refCount.current}`}
          name={`workoutInput${props.refCount.current}`} 
          defaultValue={workouts.exercise}
          aria-label={`Input name of ${workouts.exercise}`}
          readOnly
          autoFocus
        />

        <label htmlFor={`muscleGroupInput${props.refCount.current}`}/>
        <input
          className="focus-row workout-rows"
          id={`muscleGroupInput${props.refCount.current}`}
          name={`muscleGroupInput${props.refCount.current}`} 
          defaultValue={workouts.muscle_group}
          aria-label={`Input muscle group for ${workouts.exercise}`}
          readOnly
        />

        <label htmlFor={`setInput${props.refCount.current}`}/>
        <input
          className="sets-row workout-rows"
          id={`setInput${props.refCount.current}`}
          name={`setInput${props.refCount.current}`} 
          defaultValue={workouts.sets}
          aria-label={`Input sets for ${workouts.exercise}`}
          step="1"
          min="1"
          readOnly
        />

        <label htmlFor={`repInput${props.refCount.current}`}/>
        <input
          className="reps-row workout-rows"
          id={`repInput${props.refCount.current}`}
          name={`repInput${props.refCount.current}`} 
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
        {/* <img  src={threeDot} alt="menu to edit table" /> */}
        <div id="burger" className="threeDotImg-img">
          <li id="line1"></li>
          <li id="line2"></li>
          <li id="line3"></li>
        </div>
      </button>
      <button className="cancel-edit-button" onClick={handleEditCancel} aria-label="button to exit out of edit or delete form options">
        <img src={cancel} alt={`exit edit workout schedule button for ${formatCurrentDate(props.showDate)}`} className="cancel-edit-img" id="cancel-edit-img" />
      </button>
    </div>
    <div className="table-actions-menu">
      {props.plannedWorkout.length < 6 ? <button id="add-workout" onClick={props.newExerciseForm} type="button">Add</button> : null}
      <button onClick={handleEditSchedule} className="action-edit" type="button">Edit</button>
      <button onClick={handleDeleteSchedule} className="action-delete" type="button">Delete</button>
    </div>
    <div className="workout-table" role="table" aria-label={`Workouts planned for ${props.showDate}`}>
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
          <button id="submit-edit-exercise" type="submit" disabled={props.isSubmitting}>
            {props.isSubmitting ? "Submitting..." : "Submit Edit"}
          </button>
          <button id="delete-all-exercises" type="submit" disabled={props.isSubmitting} formMethod="DELETE" >
            {props.isSubmitting ? "Deleting..." : "Delete All Workouts"}
          </button>
        </Form>
      </div>
    </div>
  </div> : null;


  // Edit cancel button
  function handleEditCancel(event) {
    if(event) {
      window.location.reload();
    }
  };


  // Toggle schedule and edit form
  function handleEditSchedule(event) {
    const pastDateButton = document.getElementById("past-date");
    const futureDateButton = document.getElementById("future-date");
    const editWorkoutRows = document.querySelector("input.workout-rows");
    const editAllWorkoutRows = document.querySelectorAll("input.workout-rows");
    const formFocus = document.querySelectorAll("input.workout-rows");
    const cancelEditButton = document.querySelector("button.cancel-edit-button");
    const threeDotButton = document.querySelector("button.threeDotImg");
    const actionsMenu = document.querySelector("div.table-actions-menu");
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
  };


  function handleDeleteSchedule(event) {
    const pastDateButton = document.getElementById("past-date");
    const futureDateButton = document.getElementById("future-date");
    const formFocus = document.querySelectorAll("input.workout-rows");
    const cancelEditButton = document.querySelector("button.cancel-edit-button");
    const threeDotButton = document.querySelector("button.threeDotImg");
    const actionsMenu = document.querySelector("div.table-actions-menu")
    const submitDelete = document.getElementById("delete-all-exercises");
    const addWorkoutForm = document.getElementById("workout-form");
    const addWorkoutButton = document.getElementById("add-workout");
    const slideDelete = document.querySelectorAll("div.workout-tbody-row");

    if(event) {
      // Hide display date buttons
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

      // Hide menu button
      threeDotButton.classList.add("inactive");

      // Show cancel, hide actions menu, show delete workout submit button 
      cancelEditButton.classList.add("active");
      actionsMenu.classList.remove("active");
      submitDelete.classList.add("active");

      // Display individual delete buttons
      slideDelete.forEach((button) => {
        button.classList.add("delete");
      });
    }
  };


  return (
    <>
      {showSchedule}
    </>
  )
}