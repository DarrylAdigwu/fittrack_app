import React  from "react";
import { Link } from "react-router";
import profileIcon from "../assets/images/profile-icon.svg";
import logo from "../assets/images/fittracklogo.png";

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
      sessionStorage.removeItem("authToken");
      return window.location.replace(".");
    }
  }
    
  return (
    <>
      <header>
        <div className="header-container">
          <Link to="." className="logo">
            <img src={logo} alt="Fit track logo and link to homepage" className="img-logo" />
            FitTrack
          </Link>
          <img src={profileIcon} alt="person icon" className="profile" onClick={handleProfile}/>
        </div>
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