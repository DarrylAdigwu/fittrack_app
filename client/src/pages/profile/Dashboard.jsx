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

  return(
    <div className="container dash-container">
      <div className="displayDate">
        <button id="past-date" onClick={() => prevDate()}>&lt;</button>
          <span>{formatCurrentDate(showDate)}</span>
        <button id="future-date" onClick={() => nextDate()}>&gt;</button>
      </div>
    </div>
  )
}