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
    profile.classList.toggle("off")
  };

  // Logout user
    async function handleLogout() {
      const response = await fetch(import.meta.env.VITE_EXPRESS_API_LOGOUT, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
        },
        body: JSON.stringify({
          "username": props.user_name
        })
      });
      
      const data = await response.json();

      if(data.success) {
        props.removeCookies("connect.sid");
        props.removeCookies("username");
        props.removeCookies("userID");
        //props.removeCookies("recoverToken");
        sessionStorage.removeItem("authToken")
        return window.location.replace(".");
      }
    }
    
  return (
    <>
      <header>
        <Link to="." className="logo">FitTrack</Link>
        <hr/>
        <nav>
          <Link to=".">home</Link>
          <Link to="about">about</Link>
          <Link to={`dashboard/${props.user_name}`}>dash</Link>
        </nav>
        <img src={profileIcon} alt="person icon" className="profile" onClick={handleProfile}/>
      </header>
      <nav className="off-screen">
        <Link to={`dashboard/${props.user_name}`}>
          {props.user_name === ":username" ? "Log in" : "Dashboard"}
        </Link>
        {props.user_name !== ":username" && <Link onClick={handleLogout}>Logout</Link>}
      </nav>
    </>
  )
}