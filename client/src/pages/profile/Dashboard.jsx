import React from "react";
import { Form, useActionData, useLoaderData } from "react-router";
import "../../assets/css/dashboard.css";
import "../../assets/images/plusIcon.svg";
import "../../assets/images/minusIcon.svg";
import { sendData, authUser } from "../../../client-utils";


export async function loader({ request }) {
  
}

export async function action({ request }) {
  
}

export default function Dashboard() {
  return(
    <div className="container dash-container">

    </div>
  )
}