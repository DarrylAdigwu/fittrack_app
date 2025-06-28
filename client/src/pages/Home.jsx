import React from "react";
import { NavLink } from "react-router";
import "../assets/css/home.css";
import phoneMock from "../assets/images/mock-phone.png";

export default function Home() {
  return(
    <div className="home-container">
      <div className="home-bg">
        <div className="overlay"></div>
      </div>
      <section className="home-cta">
        <div className="cta-texts">
          <h1>Make planning feel easy</h1>
          <p>
            FitTrack is your reliable workout partner.
          </p>
          <NavLink to="register">Get Started</NavLink>
        </div>
        <div className="mock-img">
          <img className="phone-mock-img" src={phoneMock} alt="mock up of site on iphone"/>
        </div>
      </section>
      <div className="about-container">
            <section className="about-cta">
            <div className="banner"></div>
            <div className="about-text">
              <h1>Your fitness journey starts here</h1>
              <p>
                We make it our mission to be the workout partner you can rely on.
                Plan your workout for the day or in advance, record your exercises, 
                and save your progress. 
              </p>
            </div>
            </section>
          </div>
    </div>
  )
}