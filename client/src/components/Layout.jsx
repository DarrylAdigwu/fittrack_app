import React from "react";
import { Outlet } from "react-router";
import { useCookies } from "react-cookie";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const [cookies, setCookies, removeCookie] = useCookies([""]);
  const username = cookies.username ? `${cookies.username}` : ":username";
  
  function handleRemoveCookies(name) {
    removeCookie(`${name}`, { path: "/" })
  }

  return(
    <main>
      <div id="content-wrapper">
        <Header user_name={username} cookies={cookies} removeCookies={handleRemoveCookies}/>
        <Outlet />
      </div>
      <Footer />
    </main>
  )
}