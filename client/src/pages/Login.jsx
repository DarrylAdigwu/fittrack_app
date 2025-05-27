import React from "react";
import { useActionData, Form, NavLink } from "react-router";

export async function action({ request }) {
  // Form data
  const formData = await request.formData();
  const allData = Object.fromEntries(formData);
  const url = new URL(request.url);
  
  // Send form data to server
  const sendFormData = await sendData("login", allData);

}

export default function Login() {
  const actionData = useActionData();
  
  return(
    <div className="container login-container">
      <section className="login-main">
        <h1>Log In</h1>
        <Form method="post" className="login-form">
          {/* 
          <label htmlFor="reg-email">Email:</label>
          <input name="email" type="email" id="reg-email" placeholder="Email" autoComplete="on" autoFocus />
          <label htmlFor="firstName">First Name:</label>
          <input name="firstName" type="text" id="firstName" placeholder="First Name" autoComplete="on"/>
          <label htmlFor="lastName">Last Name:</label>
          <input name="lastName" type="text" id="lastName" placeholder="Last Name" autoComplete="on"/> 
          */}
          <label htmlFor="username"/>
          <input name="username" type="text" id="username" placeholder="Username" autoComplete="on" autoFocus required />
          
          <label htmlFor="login-password"/>
          <input name="password" type="password" id="login-password" placeholder="Password" autoComplete="off" required/>

          <button>Log in</button>
        </Form>
        <aside>Don't have an account? <NavLink to="/register">Register here</NavLink></aside>
      </section>
    </div>
  )
}