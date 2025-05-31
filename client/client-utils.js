/* Send form data to server */
export async function sendData(route, allData, prevUrl = null) {
  let prevParam;

  if(prevUrl) {
    const params = new URL(prevUrl.href);
    prevParam = params.searchParams.get("redirect");
  }

  try {
    const response = await fetch(`https://api.stage.fittracker.us/api/${route}`, {
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
    sessionStorage.setItem("authToken", responseData.authToken);
    return window.location.replace(`${responseData.redirectUrl}`);
  } else {
    return responseData;
  };

  } catch(err) {
  console.error("Error:", err)
  throw err;
  }
}


/* Authenticate user */
export async function authUser(request) {
  const url = new URL(request.url)
  const pathname = url.pathname;
  
  try{
    const response = await fetch(`https://api.stage.fittracker.us/api${pathname}`, {
      method: 'GET',
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
      },
      credentials: "include"
    })

    if(response.status === 401) {
      return window.location.replace(`/login`)
    }

    return;

  } catch(err) {
    console.error("Error with authentication:", err)
  }
}


/* Get Current Dates workouts */
export async function getTodaysWorkout(date = "null") {
  const fetchUrl = date ? 
  `https://api.stage.fittracker.us/api/dashboard/:username?date=${date}` : 
  `https://api.stage.fittracker.us/api/dashboard/:username`;
  try {
    const response = await fetch(`${fetchUrl}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${sessionStorage.getItem("authToken")}`
      }
    })
    
    if(!response.ok) {
      throw new Error(`HTTP ERROR: ${response.status}` )
    }

    const data = await response.json();
    return data;

  } catch(err) {
    console.error("Error:", err)
  }
}