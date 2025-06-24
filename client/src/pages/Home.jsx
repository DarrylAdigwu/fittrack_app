import React from "react";
import { NavLink } from "react-router";
import "../assets/css/home.css";

export default function Home() {
  return(
      <div className="container home-container">
        <div className="home-bg">
          <div className="overlay"></div>
        </div>
        <section className="main home-cta">
        <h1>Make planning feel easy</h1>
          <p>
            FitTrack is your reliable workout partner. Start 
            planning and tracking your daily 
            fitness routines.
          </p>
          <NavLink to="register">Get Started</NavLink>
        </section>
      </div>
  )
}