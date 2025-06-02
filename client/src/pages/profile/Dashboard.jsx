import React from "react";
import { Form, useActionData, useLoaderData } from "react-router";
import "../../assets/css/dashboard.css";
import "../../assets/images/plusIcon.svg";
import "../../assets/images/minusIcon.svg";
import { sendData, authUser, getTodaysWorkout} from "../../../client-utils";


export async function loader({ request }) {
  await authUser(request);
  return await getTodaysWorkout(new Date()); 
}

export async function action({ request }) {
  
}

export default function Dashboard() {
  const dashLoader = useLoaderData();
  const actionData = useActionData();
  const [exerciseCount, setExerciseCount] = React.useState(2);
  const [showDate, setShowDate] = React.useState(new Date());
  const [plannedWorkout, setPlannedWorkout] = React.useState(dashLoader.getWorkout);
  const [isLoading, setIsLoading] = React.useState(null)

  // Get key and make it string if error in form 
  let key = actionData ? Object.keys(actionData).toString() : null;

  // Display current date to page
  function formatCurrentDate(date) {
    let options = {
      weekday: "short", 
      year: "numeric",
      month: "short",
      day: "numeric",
    };

    return new Intl.DateTimeFormat(undefined, options).format(date);
  }

  // Display previous date
  function prevDate() {
    setShowDate((prev) => {
      const currentDate = new Date(prev);
      const prevDate = currentDate.setDate(currentDate.getDate() - 1);
      return prevDate;
    });
  };

  // Display next date
  function nextDate() {
    setShowDate((prev) => {
      const currentDate = new Date(prev);
      const nextDate = currentDate.setDate(currentDate.getDate() + 1);
      return nextDate;
    });
  };


  // Get current day's workout
  React.useEffect(() => {
    async function loadWorkout(date) {
      try {
        const getExercise = await getTodaysWorkout(new Date(date));
        setPlannedWorkout(getExercise.getWorkout)
      } catch(err) {
        console.error("Error:", err)
      }
    }
    loadWorkout(showDate)
  }, [showDate]);

  // Display form for planned workout
  const todaysSchedule = plannedWorkout ? 
    plannedWorkout.map((workouts) => {
      return (                                                                                                                                                                    
        <tbody key={workouts.id}>            
          <tr className="focus-row">
            <td>{workouts.muscle_group}</td>
          </tr> 
          
          <tr className="exercise-row">
            <td>{workouts.exercise}</td>
          </tr>
          
          <tr className="reps-row">
            <td>{workouts.reps}</td>
          </tr>
        </tbody>
      )
    }) : null


    // Show no schedule or schedule depending on loaderData
  const showSchedule = todaysSchedule ? 
    <div className="schedule">
      <table>
        <thead>
          <tr className="table-head-row">
            <th className="focus">Focus</th>
            <th className="exercise">Exercise</th>
            <th className="reps">Reps</th>
          </tr>
        </thead>
        {todaysSchedule}
      </table>
    </div> :
    <div className="no-schedule" id="no-schedule">
      <h1>No workout schedule for today</h1>
      {plannedWorkout === null && <button id="add-workout" type="button">Add workout</button>}
    </div>


    // Create form for new workout
    function newForm(e) {
      const hideNoScheduleContainer = document.getElementById("no-schedule");
      const showContainer = document.getElementById("workout-form");

      if(e.currentTarget) {
        hideNoScheduleContainer.style.display = "none";
        showContainer.style.display = "flex";
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
              required
            />

            <label htmlFor="muscleGroupInput1"></label>
            <input className="muscleGroupInput" 
              id="muscleGroupInput1" 
              name="muscleGroupInput1" 
              placeholder="Focus"
              aria-label="Input muscle group for exercise number one"
              required
            />

            <label htmlFor="repInput1"></label>
            <input className="repInput"
              type="number" 
              id="repInput1" 
              name="repInput1" 
              placeholder="Reps" 
              aria-label="Input reps for exercise number one"
              required
              step="1"
              min="1"
            />
          </div>
          {/* <div className="exercise-btn-container">
            <div id="add-exercise" onClick={newExercise} aria-label="add exercise input">
              <img src={plusIcon} alt="plus sign" />
              Add
            </div>
            <div id="remove-exercise" onClick={removeExercise} aria-label="remove exercise input">
              <img src={minusIcon} alt="minus sign" />
              Remove
            </div>
          </div>
          {actionData && key.startsWith("invalid") ? <span className="invalidDash">{actionData[key]}</span> : null} */}
          <button id="submit-exercise" type="submit">{isLoading ? "Submitting..." : "Submit"}</button>
        </Form>
      </div>
    </div>
  )
}