import React from "react";
import { Outlet } from "react-router";
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";
import { useCookies } from "react-cookie";
import { jwtDecode } from "jwt-decode";

export default function Layout() {
  const [cookies, setCookies, removeCookie] = useCookies([""]);
  const [username, setUsername] = React.useState("");
  const [id, setId] = React.useState("");

  // Retrieve user info
  React.useEffect(() => {
    const userToken = cookies["user-token"];
    const idToken = cookies["id-token"];

    if(userToken && idToken) {
      let decodeUser = null;
      let decodeId = null;

      try{
        decodeUser = jwtDecode(userToken);
        decodeId = jwtDecode(idToken);
        setUsername(decodeUser.username)
        setId(decodeId.id)
      } catch (error) {
        console.error('Error decoding token', error)
      }
    }
  }, []);

  // Delete Cookies
  function handleRemoveCookies(name) {
    removeCookie(`${name}`, { path: "/", domain: ".fittracker.us" })
  }

  return(
    <main>
      <div id="content-wrapper">
        <Header user_name={username} removeCookies={handleRemoveCookies}/>
        <Outlet />
      </div>
      <Footer />
    </main>
  )
}