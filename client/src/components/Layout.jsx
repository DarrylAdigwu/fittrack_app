import React from "react";
import { useLoaderData } from "react-router";

export async function loader({ request }) {
  try{
    const response = await fetch(`https://fittrack-server-api.onrender.com/api`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })

    if(!response.ok) {
      throw new Error(`HTTP ERROR ${response.status}`)
    }

    const data = await response.json();
    return data;
  } catch(err) {
    console.error("Error:", err)
  }
}

export default function Layout() {
  const loader = useLoaderData();
  
  return(
    <>
      <h1>{loader.checking.word}</h1>
    </>
  )
}