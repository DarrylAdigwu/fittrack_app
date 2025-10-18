import React from "react";
import { useActionData, useLoaderData, useNavigation, useSearchParams } from "react-router";
import "../../assets/css/dashboard.css";
import "../../assets/css/plannedWorkouts.css";
import "../../assets/css/dateDisplay.css";
import "../../assets/css/createWorkout.css";
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
    // Check what type of form was sent
    const workoutSetsFrom = Object.keys(allData).some((key) => key.startsWith("deleteSetCheckbox"));

    // Object to hold deleted data id's
    let dataDelete = {};
    let dataUpdate = {};

    // loop through form data object and get id's and push to dataDelete obj
    for(const [key, value] of Object.entries(allData)) {
      if(key.startsWith("checkbox") || key.startsWith("displayDate") || key.startsWith("deleteSetCheckbox")) {
         dataDelete[`${key}`] = value;
      }
    }

    for(const [key, value] of Object.entries(allData)) {
      if(key.startsWith("setIdInput")) {
         dataUpdate[`${key}`] = value;
      }
    }

    // Send dataDelete obj to server
    let sendWorkouts;
    
    if(!workoutSetsFrom) {
      sendWorkouts = await sendUserData(`dashboard/${usersUsername}`, dataDelete, "DELETE");
    } else {
      sendWorkouts = await sendUserData(`dashboard/${usersUsername}`, {dataDelete, dataUpdate}, "DELETE");
    }
    
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
  const [setsCount, setSetsCount] = React.useState(2);
  const [searchParams, setSearchParams] = useSearchParams(`?date=${new Date()}`);
  const [showDate, setShowDate] = React.useState();
  const [plannedWorkout, setPlannedWorkout] = React.useState();
  const [plannedSets, setPlannedSets] = React.useState();
  const navigation = useNavigation();
  const refCount = React.useRef(1);
  const [isActive, setIsActive] = React.useState(false);

  // Submitting state 
  const isSubmitting = navigation.state === "submitting";

  // Get value for date search param state
  const dateParam = searchParams.get("date");

  // Get key and make it string if error in form 
  let errorKey = actionData ? Object.keys(actionData).toString() : null;

  // Get all workout dates
  const allUserDates = dashLoader.allDates;

  // Load for current date using show date
  React.useEffect(() => {
    async function loadTodaysWorkout() {
      try {
        const getExercise = await getTodaysWorkout(formatCurrentDate(new Date(dateParam)));
        setPlannedWorkout(getExercise.getWorkout);
        setPlannedSets(getExercise.getSets);
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

    // When screen is smaller than 1080px
    if(windowWidth < 1080) {
      // Enable calendar drop down button
      if(calendarButton) {
        calendarButton.disabled = false;
      }
    }

    // When screen is larger than 1079px
    if(windowWidth > 1079) {
      // Actively isplay calendar on dashboard
      if(displayCal && displayCal.classList.contains("active")) {
        displayCal.classList.remove("active");
      }
      // Disable drop down calendar button
      if(calendarButton) {
        calendarButton.disabled = true;
      }
      // Scroll page to top 
      if(scroll) {
        scroll.scrollTop = 0;
      }
    }
  };

  // Run scree sizing function with window event listener
  checkScreenSize();
  window.addEventListener("resize", checkScreenSize);

  return(
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
          plannedSets={plannedSets}
          exerciseCount={exerciseCount} 
          setExerciseCount={setExerciseCount}
          setsCount={setsCount}
          setSetsCount={setSetsCount} 
          refCount={refCount} 
          isSubmitting={isSubmitting} 
          dateParam={dateParam} 
          newExerciseForm={newExerciseForm}
          isActive={isActive}
          setIsActive={setIsActive}
        />
      </div>
      <Calendar allDates={allUserDates} />
    </div>
  )
}