import React from "react";
import { isRouteErrorResponse, useRouteError, Link } from "react-router";
import "../assets/css/errorBound.css";

export default function ErrorBoundary() {
  const error = useRouteError();
  console.log(error);
  let errorContent;

  if(isRouteErrorResponse(error)) {
    errorContent = 
    <div className="errBound-status">
      <h1>Oh no. {error.status}</h1>
      <p>{error.statusText}</p>
      {error.data?.message && <p>{error.data.message}</p>}
    </div>
  } else if (error instanceof Error) {
    errorContent = 
    <div className="errBound-status">
      <h1>ERROR.ERROR.ERROR.ERROR.ERROR.ERROR.ERROR.ERROR.ERROR.ERROR</h1>
      <p>
        Sorry an error has occurred on this page.<br/>
        Lets get back on track...
      </p>
    </div>
  } else {
    errorContent = <h1>Unknown Error</h1>
  }

  return(
    <div className="errBound-container">
      {errorContent}
      <Link to="/">Back to Fittrack</Link>
    </div>
  )
}