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
    //return window.location.replace(`${responseData.redirectUrl}`);
  } else {
    return responseData;
  };

  } catch(err) {
  console.error("Error:", err)
  throw err;
  }
}
