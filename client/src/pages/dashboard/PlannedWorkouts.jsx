import React from "react";
import { Form } from "react-router";
import cancel from "../../assets/images/cancel.svg";
import caretDown from "../../assets/images/caret-down.svg";
import caretUp from "../../assets/images/caret-up.svg";
import threeDotVert from "../../assets/images/three-dot-vert.svg";
import trash from "../../assets/images/trash.svg"
import { formatCurrentDate, usersUsername } from "../../../client-utils";

export default function PlannedWorkouts(props) {
  const [dropDownCheck, setDropDownCheck] = React.useState(null); 

  // Toggle drop down nav
  function handleDropDown(event) {
    const threeDotButton = document.querySelector("button.threeDotImg");
    const actionsMenu = document.querySelector("div.table-actions-menu")
    
    if(event) {
      // Toggle isActive state / toggle sets forms
      props.setIsActive(prevActivity => !prevActivity ? true : false);

      threeDotButton.classList.toggle("active");
      actionsMenu.classList.toggle("active");
    }
  }

  // Create inputs for add sets form
  function newSets(event) {
    // console.log(event)
    const currentExerciseDivId = event.target.parentElement.parentElement.id;
    const currentWorkoutId = currentExerciseDivId.split("-")[1];
    const currentSetsForm = document.getElementById(`setsForm-${currentWorkoutId}`)
    const currentExerciseDiv = document.getElementById(`${currentExerciseDivId}`);
    
    // Get the number of already saved sets for this exercise
    let numberOfPlannedSets = 0;

    currentSetsForm.childNodes.forEach((input) => {
      if(input.className === "plannedSetsForm") {
        numberOfPlannedSets += 1;
      }
    });
    
    // Error key element
    const setsWarningKey = document.getElementById(`sets-warning-key-${currentWorkoutId}`);

    // Check if there are more than 6 sets created
    if(props.setsCount > 6) {
     return setsWarningKey.classList.add("inactive");
    } 
    
    // Check if sets planned and sets being created are more than 6
    if(props.plannedSets && (numberOfPlannedSets + props.setsCount) > 6) {
      return setsWarningKey.classList.add("inactive");
    }

    const prevSetNumDisplay = document.getElementById(`setNumDisplay${currentWorkoutId}-${props.setsCount - 1}`);
    const prevWeightInput = document.getElementById(`weightInput${currentWorkoutId}-${props.setsCount - 1}`);
    const prevRepInput = document.getElementById(`repInput${currentWorkoutId}-${props.setsCount - 1}`);
    
    
    // Check to see if previous inputs have values
    if(!prevSetNumDisplay.value) {
      return prevSetNumDisplay.style.backgroundColor = "#d56d6a";
    } else {
      prevSetNumDisplay.style.backgroundColor = "transparent";
    }
    
    if(!prevWeightInput.value || isNaN(prevWeightInput.value)) {
      return prevWeightInput.style.backgroundColor = "#d56d6a";
    }else {
      prevWeightInput.style.backgroundColor = "transparent";
    }

    if(!prevRepInput.value || isNaN(prevRepInput.value)) {
      return prevRepInput.style.backgroundColor = "#d56d6a";
    }else {
      prevRepInput.style.backgroundColor = "transparent";
    }

    // Creating new inputs for sets form
    if(document.getElementById(`setNumDisplay${currentWorkoutId}-${props.setsCount - 1}`).value &&
    document.getElementById(`weightInput${currentWorkoutId}-${props.setsCount - 1}`).value &&
    document.getElementById(`repInput${currentWorkoutId}-${props.setsCount - 1}`).value) {

      // Remove previous error indicators if sets are less than 6
      if(props.setsCount <= 6) {
        setsWarningKey.classList.remove("inactive")
      } 
      
      // Remove previous error indicators if planned sets and sets are < 6
      if(props.plannedSets || props.plannedSets && (props.setsCount + numberOfPlannedSets) <= 6) {
        setsWarningKey.classList.remove("inactive");
      }

      // Turn inputs to error free background colot
      prevSetNumDisplay.style.backgroundColor = "transparent";
      prevWeightInput.style.backgroundColor = "transparent";
      prevRepInput.style.backgroundColor = "transparent";
    
      // Chaging state of exercise count
      props.setSetsCount(prevCount => prevCount + 1);

      // Previous input box
      const prevSetBox = document.getElementById(`setBoxes${currentWorkoutId}-${props.setsCount - 1}`)
      
      // create div
      const setBoxes = document.createElement("div");
      setBoxes.setAttribute("class", "setBoxes createdSetBox");
      setBoxes.setAttribute("id", `setBoxes${currentWorkoutId}-${props.setsCount}`);
      
      /* Create labels and inputs */
      const deletePlaceholder = document.createElement("input");
      deletePlaceholder.setAttribute("type", "checkbox");
      deletePlaceholder.setAttribute("disabled", "disabled");
      deletePlaceholder.setAttribute("id", `setBoxDeletePlaceholder${currentWorkoutId}-${props.setsCount}`)
      deletePlaceholder.setAttribute("class", "setBoxDeletePlaceholder");

      // Set Number Display input
      const newSetNumDisplayLabel = document.createElement("label");
      newSetNumDisplayLabel.setAttribute("for", `setNumDisplay${currentWorkoutId}-${props.setsCount}`);
      
      const newSetNumDisplayInput = document.createElement("input");
      newSetNumDisplayInput.setAttribute("class", "setNumDisplay");
      newSetNumDisplayInput.setAttribute("id", `setNumDisplay${currentWorkoutId}-${props.setsCount}`);
      newSetNumDisplayInput.setAttribute("name", `setNumDisplay${currentWorkoutId}-${props.setsCount}`);
      newSetNumDisplayInput.setAttribute("placeholder", ``);
      newSetNumDisplayInput.setAttribute("value", `${numberOfPlannedSets + props.setsCount}`);
      newSetNumDisplayInput.setAttribute("readonly", "readonly");
      newSetNumDisplayInput.setAttribute("aria-label", `Display for set number ${props.setsCount}`);
      
      // Weight input
      const newWeightLabel = document.createElement("label");
      newWeightLabel.setAttribute("for", `weightInput${currentWorkoutId}-${props.setsCount}` );
      
      const newWeightInput = document.createElement("input");
      newWeightInput.setAttribute("class", "weightInput");
      newWeightInput.setAttribute("type", "number");
      newWeightInput.setAttribute("id", `weightInput${currentWorkoutId}-${props.setsCount}`);
      newWeightInput.setAttribute("name", `weightInput${currentWorkoutId}-${props.setsCount}`);
      newWeightInput.setAttribute("placeholder", 0);
      newWeightInput.setAttribute("aria-label", `Input weight for set ${props.setsCount} on exercise number ${currentWorkoutId}`);

      // Reps input
      const newRepLabel = document.createElement("label");
      newRepLabel.setAttribute("for", `repInput${currentWorkoutId}-${props.setsCount}` );
      
      const newRepInput = document.createElement("input");
      newRepInput.setAttribute("class", "repInput");
      newRepInput.setAttribute("id", `repInput${currentWorkoutId}-${props.setsCount}`);
      newRepInput.setAttribute("name", `repInput${currentWorkoutId}-${props.setsCount}`);
      newRepInput.setAttribute("placeholder", 0);
      newRepInput.setAttribute("step", 1);
      newRepInput.setAttribute("min", 1);
      newRepInput.setAttribute("aria-label", `Input reps for exercise number ${currentWorkoutId} set ${props.setsCount}`);

      // Completion checkbox
      const newHiddenCheckboxLabel = document.createElement("label");
      newHiddenCheckboxLabel.setAttribute("for", `setCheckbox${currentWorkoutId}-${props.setsCount}`);

      const newHiddenCheckboxInput = document.createElement("input");
      newHiddenCheckboxInput.setAttribute("type", "hidden");
      newHiddenCheckboxInput.setAttribute("class", "setCheckbox");
      newHiddenCheckboxInput.setAttribute("id", `setCheckbox${currentWorkoutId}-${props.setsCount}`);
      newHiddenCheckboxInput.setAttribute("name", `setCheckbox${currentWorkoutId}-${props.setsCount}`);
      newHiddenCheckboxInput.setAttribute("value", 0);
      newHiddenCheckboxInput.setAttribute("aria-label", `Checkbox to show completion of set ${props.setsCount}`);

      // Completion checkbox
      const newCheckboxLabel = document.createElement("label");
      newCheckboxLabel.setAttribute("for", `setCheckbox${currentWorkoutId}-${props.setsCount}`);

      const newCheckboxInput = document.createElement("input");
      newCheckboxInput.setAttribute("type", "checkbox");
      newCheckboxInput.setAttribute("class", "setCheckbox");
      newCheckboxInput.setAttribute("id", `setCheckbox${currentWorkoutId}-${props.setsCount}`);
      newCheckboxInput.setAttribute("name", `setCheckbox${currentWorkoutId}-${props.setsCount}`);
      newCheckboxInput.setAttribute("value", 1);
      newCheckboxInput.setAttribute("aria-label", `Checkbox to show completion of set ${props.setsCount}`);
      
      // Space holding box
      const blankBoxButton = document.createElement("button");
      blankBoxButton.setAttribute("class", "setBoxesSpaceHolder")

      // append child nodes
      setBoxes.appendChild(deletePlaceholder)
      setBoxes.appendChild(newSetNumDisplayLabel);
      setBoxes.appendChild(newSetNumDisplayInput);
      setBoxes.appendChild(newWeightLabel);
      setBoxes.appendChild(newWeightInput);
      setBoxes.appendChild(newRepLabel);
      setBoxes.appendChild(newRepInput);
      setBoxes.appendChild(newHiddenCheckboxLabel);
      setBoxes.appendChild(newHiddenCheckboxInput);
      setBoxes.appendChild(newCheckboxLabel);
      setBoxes.appendChild(newCheckboxInput);
      setBoxes.appendChild(blankBoxButton);
      
      // append div
      prevSetBox.after(setBoxes);
    }
  };

  // Remove latest new exercise input
  function removeSet(event) {
    const currentExerciseDivId = event.target.parentElement.parentElement.id;
    const currentWorkoutId = currentExerciseDivId.split("-")[1];
    const firstSetBox = document.getElementById(`setBoxes${currentWorkoutId}-1`);
    const lastSetBox = document.getElementById(`setBoxes${currentWorkoutId}-${props.setsCount - 1}`);

    if(lastSetBox != firstSetBox) {
      lastSetBox.remove();
      props.setSetsCount(prevCount => prevCount - 1)
    };
  };

  // Display form for planned workouts and starting form for new inputs
  const todaysSchedule = props.plannedWorkout ?

    props.plannedWorkout.map((workouts) => {
      const amountOfSets = props.plannedSets && props.plannedSets.filter((sets) => sets.workout_id === workouts.id);
      const currentSetNumber = props.plannedSets && amountOfSets.length + (props.setsCount - 1);
      const checkWorkoutHasSets =  props.plannedSets && props.plannedSets.some((set) => set.workout_id === workouts.id);

      /* Variable for display sets that are already created */
      const createPlannedSets = props.plannedSets && props.plannedSets.map((sets) => {
        if(sets.workout_id === workouts.id) {
          return(
            <div key={sets.id} className="plannedSetsForm" id={`plannedSetsForm-${workouts.id}`}>
              <input
                className="setIdInput planned"
                id={`setIdInput-${sets.workout_id}-${sets.set_number}`}
                name={`setIdInput-${sets.workout_id}-${sets.set_number}`}
                placeholder=""
                type="hidden"
                value={sets.id}
              />

              <input 
                className="deleteSetCheckboxes planned"
                type="checkbox"
                id={`deleteSetCheckbox-${sets.workout_id}-${sets.set_number}`}
                name={`deleteSetCheckbox-${sets.workout_id}-${sets.set_number}`}
                value={sets.id}
              />

              <input
                className="plannedSetNumber planned"
                id={`plannedSetNumber${sets.workout_id}-${sets.set_number}`}
                name={`plannedSetNumber${sets.workout_id}-${sets.set_number}`}
                value={sets.set_number}
                readOnly
                aria-label="Set number"
              />

              <input
                className="plannedWeight planned"
                id={`plannedWeight${sets.workout_id}-${sets.set_number}`}
                name={`plannedWeight${sets.workout_id}-${sets.set_number}`}
                defaultValue={sets.weight}
                readOnly
                aria-label={`Weight for set ${sets.set_number} on exercise number ${sets.workout_id}`}
              />
              <input
                className="plannedReps planned"
                id={`plannedReps${sets.workout_id}-${sets.set_number}`}
                name={`plannedReps${sets.workout_id}-${sets.set_number}`}
                defaultValue={sets.reps}
                readOnly
                aria-label={`Reps for set ${sets.set_number} on exercise number ${sets.workout_id}`}
              />

              <input
                type="hidden" 
                className="plannedCheckboxes planned"
                id={`plannedCheckboxes${sets.workout_id}-${sets.set_number}`}
                name={`plannedCheckboxes${sets.workout_id}-${sets.set_number}`}
                aria-label={`Send info for incomplete set ${sets.set_number} on exercise number ${sets.workout_id}`}
                value={0}
              />

              <input
                type="checkbox"
                className="plannedCheckboxes planned"
                id={`plannedCheckboxes${sets.workout_id}-${sets.set_number}`}
                name={`plannedCheckboxes${sets.workout_id}-${sets.set_number}`}
                value={1}
                aria-label={`Show completion for set ${sets.set_number} on exercise number ${sets.workout_id}`}
                disabled
                defaultChecked={sets.completed === 1 && true}
              />

              {/* Placeholder to match header row menu button */}
              <button 
                className="plannedSpaceHolder planned" 
                type="button" 
                disabled
              >
              </button>
            </div>
          )
        }
      })

      return (
        /* Workout table-body row */
        <div 
          key={workouts.id} 
          className={`workout-tbody-row workout-tbody-row-${props.refCount.current = props.refCount.current + 1}`} 
          id={`workout-tbody-row${workouts.id}`}
        >
          {/* Container for for the current exercise */}
          <div className={`tbody-row-exercise-container`} id={`tbody-row-exercise-container${workouts.id}`}>
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
            
            {/* Button to drop sets form */}
            <button 
              className="dropSetsButton dropSets" 
              id={`dropSets${workouts.id}`}
              type="button"
              onClick={handleSetsFormDropDown} 
              aria-label="drop down list of sets for current workouts"
              >
              <img src={caretDown} id={`setsCaretDown-${workouts.id}`}/>
            </button>
            {/* Button to lift sets form */}
            <button 
              className="dropSetsButton liftSets" 
              id={`liftSets${workouts.id}`}
              type="button"
              onClick={handleSetsFormDropDown} 
              aria-label="lift up list of sets for current workout"
              >
              <img src={caretUp} id={`setsCaretUp-${workouts.id}`}/>
            </button>
          </div>

          {/* Display sets for planned workouts if edit/delete execise form is not active */}
          {!props.isActive &&
            <Form method="post" id={`setsForm-${workouts.id}`} className={`setsForm`} action={`/dashboard/:${usersUsername}`}>
              {/* Planned sets Header */}
              <div className="sets-thead-section" role="rowgroup">
                <div className="sets-thead-row" id={`sets-thead-row-${workouts.id}`} role="row">
                  <img src={trash} alt="" className="theadSpaceHolder" />
                  <div className="th set"role="cell">Set</div>
                  <div className="th weight"role="cell">Weight</div>
                  <div className="th reps"role="cell">Reps</div>
                  <div className="th checkbox"role="cell">&#10003;</div>
                  {/* Menu and cancel buttons for sets */}
                  <button
                    className="edit-setsButton"
                    id={`edit-set-${workouts.id}`}
                    onClick={handleSetMenuDropDown}
                    type="button"
                  >
                    <img 
                      src={threeDotVert} 
                      alt={`menu for ${workouts.exercise} exercise`}
                    />
                  </button>
                  <button
                    className="cancel-setsButton"
                    id={`cancel-set-${workouts.id}`}
                    onClick={handleCancelSetsMenu}
                    type="button"
                  >
                    <img 
                      src={cancel} 
                      alt={`cancel menu for ${workouts.exercise} exercise`}
                    />
                  </button>
                </div>
                {/* Drop down menu for deleting and editing sets */}
                <div className="setsDropMenu" id={`setsDropMenu-${workouts.id}`}>
                  {checkWorkoutHasSets ?
                    <>
                      <button 
                      className="setsDropMenu-edit"
                      id={`setsDropMenu-edit-${workouts.id}`} 
                      type="button"
                      onClick={handleSetsMenu}
                      >
                        Edit
                      </button>
                      <button 
                        className="setsDropMenu-delete"
                        id={`setsDropMenu-delete-${workouts.id}`}
                        type="button"
                        onClick={handleSetsMenu}
                      >
                        Delete
                      </button>
                    </> :
                    <button 
                      type="button" 
                      disabled 
                      className="setsDropMenu-noSets"
                    >
                      Create sets for this workout
                    </button>
                  }
                </div>
              </div>

              {/* Display planned sets for current exercise */}
              {createPlannedSets}

              {/* Create starting form field for users to add sets to exercise */}
              {currentSetNumber <= 6 ?
                <div className="setBoxes" id={`setBoxes${workouts.id}-1`}>
                  <input 
                    id="displayDate" 
                    className="displayDate" 
                    name="displayDate" 
                    placeholder="" 
                    type="hidden" 
                    value={formatCurrentDate(props.showDate)}
                    />

                  <input
                    className="workoutIdInput"
                    id={`workoutIdInput_${props.refCount.current}`}
                    name={`workoutIdInput_${props.refCount.current}`}
                    placeholder=""
                    type="hidden"
                    value={workouts.id}
                  />

                  <input
                    className="workoutName"
                    id={`workoutName_${props.refCount.current}`}
                    name={`workoutName_${props.refCount.current}`} 
                    defaultValue={workouts.exercise}
                    type="hidden"
                  />
                  
                  {/* Placeholder to match planned sets delete checkbox */}
                  <input
                    type="checkbox"
                    className="setBoxDeletePlaceholder"
                    id={`setBoxDeletePlaceholder${workouts.id}-1`}
                    disabled
                  />

                  <input 
                    className="setNumDisplay"
                    type="text" 
                    id={`setNumDisplay${workouts.id}-1`} 
                    name={`setNumDisplay${workouts.id}-1`}  
                    placeholder=""
                    defaultValue={props.plannedSets ? currentSetNumber : props.setsCount - 1}
                    readOnly
                    aria-label="Set number"
                    />

                  <input 
                    className="weightInput"
                    type="number" 
                    id={`weightInput${workouts.id}-1`} 
                    name={`weightInput${workouts.id}-1`} 
                    placeholder="0" 
                    autoFocus
                    aria-label="Input weight for set one on exercise number one"
                    />

                  <input 
                    className="repInput"
                    type="number" 
                    id={`repInput${workouts.id}-1`} 
                    name={`repInput${workouts.id}-1`} 
                    placeholder="0" 
                    aria-label="Input reps for exercise number one"
                    step="1"
                    min="1" 
                  />

                  {/* Checkboxes to check if set is complete or not */}
                  <input
                    type="hidden" 
                    className="setCheckbox"
                    id={`setCheckbox${workouts.id}-1`}
                    name={`setCheckbox${workouts.id}-1`} 
                    aria-label={`Checkbox to show completion of set 1`}
                    value={0}
                  />

                  <input 
                    type="checkbox" 
                    className="setCheckbox"
                    id={`setCheckbox${workouts.id}-1`}
                    name={`setCheckbox${workouts.id}-1`} 
                    aria-label={`Checkbox to show completion of set 1`}
                    value={1}
                  />
                  {/* Placeholder to match header row menu button  */}
                  <button className="setBoxesSpaceHolder" type="button"> 
                  </button>
                </div> : null
              }

              {/* Max set warning key */}
              <span 
                id={`sets-warning-key-${workouts.id}`}
                className="sets-warning-key" 
                aria-label="workout limit message">Exercise Limit Hit: 6 sets
              </span>
              
              {/* Visible line separator */}
              <hr />

              {/* Container for remove and add sets buttons */}
              { currentSetNumber <= 6 &&
                <div 
                  className="sets-btn-container" 
                  id={`sets-btn-container${workouts.id}`}
                >
                  <div 
                    id="add-set" 
                    onClick={newSets} 
                    aria-label="add new set input"
                  >
                    Add
                  </div>
                  <div 
                    id="remove-set" 
                    onClick={removeSet} 
                    aria-label="remove previously set input"
                  >
                    Remove
                  </div>
                  <button
                    className="add-sets-btn"
                    type="submit"
                  >
                    Submit
                  </button>
                </div>
              }
              {/* Button for submiting edit and delete forms */}
              <div className="editButtons-container" id={`editButtons-container-${workouts.id}`}>
                <button 
                  className="submit-edit-sets" 
                  id={`submit-edit-sets-${workouts.id}`}
                  formMethod="PUT"
                >
                  Submit
                </button>
                <button 
                  className="submit-delete-sets" 
                  id={`submit-delete-sets-${workouts.id}`}
                  formMethod="DELETE"
                >
                  Delete Selected Sets
                </button>
                <button
                  className="cancel-setsButton big-cancel-setsButton"
                  id={`big-cancel-set-${workouts.id}`}
                  onClick={handleCancelSetsMenu}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </Form>
          }
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