import React from "react";
import { Form, NavLink, redirect, useActionData, useNavigation } from "react-router";
import "../assets/css/account.css";
import { sendData } from "../../client-utils";

/* Action function  */
export async function action({ request }) {
  // Form data
  const formData = await request.formData();
  const allData = Object.fromEntries(formData);

  // Send Form data to server
  const sendFormData = await sendData("register", allData);

  // All server side error validation responses
  if(sendFormData.serverError) {
    return sendFormData.serverError;
  }

  // If all valid, return valid object for page redirect
  if(sendFormData.serverCheck.valid) {
    return redirect("/login");
  }
}

/** React Component **/
export default function Register () {
  const actionData = useActionData();
  const navigation = useNavigation();
  const isSubmitting = navigation.state === 'submitting'; 

  const actionKey = actionData ? Object.keys(actionData) : null;
 
  return(
    <div className="container register-container">
      <section className="reg-main">
        <h1>Create your account</h1>
        <Form method="post" action="/register" className="register-form">
          {/* 
          <label htmlFor="reg-email">Email:</label>
          <input name="email" type="email" id="reg-email" placeholder="Email" autoComplete="on" autoFocus />
          <label htmlFor="firstName">First Name:</label>
          <input name="firstName" type="text" id="firstName" placeholder="First Name" autoComplete="on"/>
          <label htmlFor="lastName">Last Name:</label>
          <input name="lastName" type="text" id="lastName" placeholder="Last Name" autoComplete="on"/> 
          */}
          <label htmlFor="username"/>
          <input name="username" type="text" id="username" placeholder="Username" autoComplete="on" aria-label="Create a username" aria-required="true" autoFocus  />
          {actionData && actionKey == "invalidUsername" || actionKey == "invalidChar" ? <span className="invalid" aria-label={actionData[actionKey]}>{actionData[actionKey]}</span> : null}
          
          <label htmlFor="reg-password"/>
          <input name="password" type="password" id="reg-password" placeholder="Password" autoComplete="off" aria-label="Create a password" aria-required="true" />
          {actionData && actionKey == "invalidPassword" ? <span className="invalid" aria-label={actionData[actionKey]}>{actionData[actionKey]}</span> : null}
          
          <label htmlFor="confirm-password"/>
          <input name="confirm-password" type="password" id="confirm-password" placeholder="Confirm Password" autoComplete="off" aria-label="Re-enter the password you created" aria-required="true" />
          {actionData && actionKey == "invalidConfirmPass" ? <span className="invalid" aria-label={actionData[actionKey]}>{actionData[actionKey]}</span> : null}
          
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Create account"}</button>
        </Form>
        <aside>Already have an account? <NavLink to="/login">Log in</NavLink></aside>
      </section>
    </div>
  )
}