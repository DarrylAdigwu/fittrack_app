import React from "react";
import { useActionData, useLoaderData, useNavigation, useSearchParams } from "react-router";
import "../../assets/css/dashboard.css";
import { sendUserData, getTodaysWorkout, formatCurrentDate,
   usersUsername, getAllDates } from "../../../client-utils.js";
import Calendar from "./Calendar.jsx";
import DateDisplay from "./DateDisplay.jsx";
import PlannedWorkouts from "./PlannedWorkouts.jsx";
import CreateWorkout from "./CreateWorkout.jsx";


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
  let errorKey = actionData ? Object.keys(actionData).toString() : null;

  // Get all workout dates
  const allUserDates = dashLoader.allDates;

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
        <DateDisplay 
          showDate={showDate} 
          setShowDate={setShowDate} 
          exerciseCount={exerciseCount} 
          setExerciseCount={setExerciseCount} 
          refCount={refCount} 
          dateParam={dateParam} 
          searchParams={searchParams} 
          setSearchParams={setSearchParams} 
          plannedWorkout={plannedWorkout} 
          setPlannedWorkout={setPlannedWorkout}
        />
        <div className="all-scheduling">
          <CreateWorkout 
            plannedWorkout={plannedWorkout} 
            showDate={showDate} 
            exerciseCount={exerciseCount} 
            setExerciseCount={setExerciseCount} 
            newExerciseForm={newExerciseForm} 
            actionData={actionData} 
            errorKey={errorKey} 
            isSubmitting={isSubmitting}
          />
          <PlannedWorkouts
            showDate={showDate} 
            plannedWorkout={plannedWorkout} 
            refCount={refCount} 
            isSubmitting={isSubmitting} 
            dateParam={dateParam} 
            newExerciseForm={newExerciseForm}
          />
        </div>
        <Calendar allDates={allUserDates} />
      </div>
    </>
  )
}