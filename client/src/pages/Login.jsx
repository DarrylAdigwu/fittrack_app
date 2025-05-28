import React from "react";
import { useActionData, Form, NavLink, useNavigate } from "react-router";
import "../assets/css/account.css";
import { sendData } from "../../client-utils";

export async function action({ request }) {
  // Form data
  const formData = await request.formData();
  const allData = Object.fromEntries(formData);
  const url = new URL(request.url);
  
  // Send form data to server
  const sendFormData = await sendData("login", allData, url);

  // All server side error validation responses
  if(sendFormData && sendFormData.serverError) {
    return sendFormData.serverError
  }
}

export default function Login() {
  const actionData = useActionData();
  const navigate = useNavigate();
  const isLogging = navigate.state === 'submitting';

  const actionKey = actionData ? Object.keys(actionData) : null;
  
  return(
    <div className="container login-container">
      <section className="login-main">
        <h1>Log In</h1>
        <Form method="post" className="login-form">
          <label htmlFor="username"/>
          <input name="username" type="text" id="username" placeholder="Username" autoComplete="on" autoFocus />
          {actionData && actionKey == "invalidUsername" || actionKey == "unauthUsername" ? <span className="invalid">{actionData[actionKey]}</span> : null}
          
          <label htmlFor="login-password"/>
          <input name="password" type="password" id="login-password" placeholder="Password" autoComplete="off" />
          {actionData && actionKey == "invalidPassword" || actionKey == "unauthPassword" ? <span className="invalid">{actionData[actionKey]}</span> : null}

          <button type="submit">{isLogging ? "Logging in..." : "Log in"}</button>
        </Form>
        <aside>Don't have an account? <NavLink to="/register">Register here</NavLink></aside>
      </section>
    </div>
  )
}