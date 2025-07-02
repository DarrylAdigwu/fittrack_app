import { jwtDecode } from "jwt-decode";


// Get Cookie Value
export function getCookie(cookieStr) {
  let username;

  // Get array of cookies
  const cookieArr = document.cookie ? document.cookie.split(";") : null;

  // Filter cookie that matches passed in value
  const findCookie = cookieArr && cookieArr.filter(cookie => {
    if(cookie.startsWith(`${cookieStr}`) || cookie.startsWith(` ${cookieStr}`)) {
      return cookie;
    } else {
      return null;
    }
  });

  // Isolate cookies value
  const cookieValue = findCookie ? findCookie.toString().split("=")[1] : null;
  
  // Decode cookie, return data
  if(cookieValue) {
    try{
      let decodeUser = jwtDecode(cookieValue);
      username = decodeUser.username
      return username;
    } catch(err) {
      console.error("Error getting cookie in top level:", err)
    }
  } else {
    return null
  }
};

/* Users name */
export const usersUsername = getCookie("user-token");

/* Send form data to server */
export async function sendData(route, allData, prevUrl = null) {
  let prevParam;

  if(prevUrl) {
    const params = new URL(prevUrl.href);
    prevParam = params.searchParams.get("redirect");
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/${route}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      allData,
      redirectParam: {prevUrl, prevParam}
    })
  });
    
  const responseData = await response.json();
  
  if(responseData && responseData.redirectUrl) {
    // Object for token signautre and expiration time
    const authTokenData = {
      token: responseData.authToken,
      expiresAt: new Date(new Date().getTime() + (60000 * 60)).toISOString()
    }
    // Store token
    sessionStorage.setItem("authToken", JSON.stringify(authTokenData));
    return window.location.replace(`${responseData.redirectUrl}`);
  } else {
    return responseData;
  };

  } catch(err) {
  console.error("Error sending data:", err)
  throw err;
  }
};


// Send data from Dashboard page
export async function sendUserData(route, allData, method) {
  if(await isTokenExpired()) {
    sessionStorage.removeItem("authToken");
    removeCookies("id-token", "user-token", "connect.sid");
    return window.location.replace("/login")
  }

  const getAuthToken = JSON.parse(sessionStorage.getItem("authToken")).token;

  try {
    const response = await fetch(`/${route}`, {
      method: `${method}`,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken}`
      },
      body: JSON.stringify({
        allData,
      })
    });

    if(response.status === 401) {
      sessionStorage.removeItem("authToken");
      removeCookies("id-token", "user-token", "connect.sid");
      return window.location.replace("/login");
    }

    const responsData = await response.json();

    return responsData;

  } catch(err) {
    console.error("Error sending user data:", err)
    throw err;
  }
};


/* Authenticate user */
export async function authUser(request) {
  const url = new URL(request.url)
  const pathname = url.pathname;
  
  // Check if token is expired
  if(await isTokenExpired()) {
    sessionStorage.removeItem("authToken");
    removeCookies("id-token", "user-token", "connect.sid");
    return window.location.replace("/login")
  } else {
    try {
    // Get value for authToken's token key
    const getAuthToken = JSON.parse(sessionStorage.getItem("authToken")).token;

    const response = await fetch(`https://api.stage.fittracker.us/api${pathname}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken}`
      },
      credentials: "include"
    })

    if(response.status === 401) {
      sessionStorage.removeItem("authToken");
      removeCookies("id-token", "user-token", "connect.sid");
      return window.location.replace(`/login`)
    }

    return;

    } catch(err) {
      console.error("Error with authentication:", err)
    }
  }
};


/* Get Current Dates workouts */
export async function getTodaysWorkout(date = "null") {

  const fetchUrl = date ? 
  `https://api.stage.fittracker.us/api/dashboard/${usersUsername}?date=${date}` : 
  `https://api.stage.fittracker.us/api/dashboard/${usersUsername}`;

  if(await isTokenExpired()) {
    sessionStorage.removeItem("authToken");
    removeCookies("id-token", "user-token", "connect.sid");
    return window.location.replace("/login")
  }

  try {
    // Get value for authToken's token key
    const getAuthToken = JSON.parse(sessionStorage.getItem("authToken")).token;

    const response = await fetch(`${fetchUrl}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getAuthToken}`
      }
    })
    
    if(response.status === 401) {
      sessionStorage.removeItem("authToken");
      removeCookies("id-token", "user-token", "connect.sid");
      return window.location.replace(`/login`)
    }

    if(!response.ok) {
      throw new Error(`HTTP ERROR: ${response.status}` )
    }

    const data = await response.json();
    return data;

  } catch(err) {
    console.error("Error getting workout:", err)
  }
};


// Check if token is expired
export async function isTokenExpired() {
  const authTokenString = sessionStorage.getItem("authToken");
  if(!authTokenString) {
    return true;
  }

  const authTokenData = JSON.parse(authTokenString);
  const expirationDate = new Date(authTokenData.expiresAt);
  return new Date() > expirationDate;
};


// Format current date
export function formatCurrentDate(date, none = null) {
  let options = {};

  if(none === "none") {
    options = {
      weekday: "short", 
      month: "short",
      day: "numeric",
    };
  } else {
    options = {
      weekday: "short", 
      year: "numeric",
      month: "short",
      day: "numeric",
    };
  }

  return new Intl.DateTimeFormat(undefined, options).format(date);
};


export function removeCookies(cookieOne, cookieTwo = null, cookieThree = null) {
  document.cookie = `${cookieOne}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  
  if(cookieTwo) {
    document.cookie = `${cookieTwo}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }

  if(cookieThree) {
    document.cookie = `${cookieThree}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  }
};


// Get all dates for users workouts
export async function getAllDates() {
  
  if(await isTokenExpired()) {
    sessionStorage.removeItem("authToken");
    removeCookies("id-token", "user-token", "connect.sid");
    return window.location.replace("/login");
  } else {
    try {
      // Get value for authToken's token key
      const getAuthToken = JSON.parse(sessionStorage.getItem("authToken")).token;

      // Send request to server
      const response = await fetch("https://api.stage.fittracker.us/api/calendar", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${getAuthToken}`
        }
      });

      // Logout user if unauthorized
      if(response.status === 401) {
        sessionStorage.removeItem("authToken");
        removeCookies("id-token", "user-token", "connect.sid");
        return window.location.replace(`/login`)
      }

      // Get other errors
      if(!response.ok) {
        throw new Error(`HTTP ERROR: ${response.status}` )
      }

      // Get values from server request
      const responseData = await response.json();

      return responseData;

    } catch(err) {
      console.error("Error getting dates from db:", err);
    }
  }
};

// Remove timezones from dates
export function dateWithoutTimezone(date) {
    if(date == "Invalid Date") {
      return null;
    }
    const parseDate = Date.parse(date)
    const dateUtcFormat = new Date(parseDate).toISOString();
    const removeTimezone = dateUtcFormat.split("T")[0];
    return removeTimezone;
};