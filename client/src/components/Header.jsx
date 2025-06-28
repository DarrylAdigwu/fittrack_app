import React  from "react";
import { Link } from "react-router";
import profileIcon from "../assets/images/profile-icon.svg"

export default function Header(props) {
  // Toggle drop down nav
  function handleProfile(event) {
    const profile = document.querySelector("nav.off-screen");

    if(event) {
      profile.classList.toggle("active")
    }
  }

  // Logout User
  async function handleLogout() {
    const response = await fetch(`https://api.stage.fittracker.us/api/logout`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "username": props.user_name
      })
    })

    const data = await response.json();

    if(data.success) {
      props.removeCookies("connect.sid");
      props.removeCookies("user-token");
      props.removeCookies("id-token");
      //props.removeCookies("recoverToken");
      sessionStorage.removeItem("authToken");
      return window.location.replace(".");
    }
  }
    
  return (
    <>
      <header>
        <Link to="." className="logo">FitTrack</Link>
        <img src={profileIcon} alt="person icon" className="profile" onClick={handleProfile}/>
      </header>
      <nav className="off-screen">
        <Link to={props.user_name ? `dashboard/:${props.user_name}` : `login`} >
          {props.user_name === "" ? "Log In" : "Dashboard"}
        </Link>
        {props.user_name !== "" && <Link onClick={handleLogout}>Logout</Link>}
      </nav>
    </>
  )
}