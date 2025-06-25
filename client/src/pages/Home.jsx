import React from "react";
import { NavLink } from "react-router";
import "../assets/css/home.css";
import phoneMock from "../assets/images/mock-phone.png"

export default function Home() {
  return(
    <div className="container home-container">
      <div className="home-bg">
        <div className="overlay"></div>
      </div>
      <section className="home-cta">
        <div className="cta-texts">
          <h1>Make planning feel easy</h1>
          <p>
            FitTrack is your reliable workout partner. Start 
            planning and tracking your daily 
            fitness routines.
          </p>
          <NavLink to="register">Get Started</NavLink>
        </div>
        <div className="mock-img">
          <img className="phone-mock-img" src={phoneMock} alt="mock up of site on iphone"/>
        </div>
      </section>
    </div>
  )
}