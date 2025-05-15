/* Send form data to server */
export async function sendData(route, allData, prevUrl = null) {
  let redirectParam;

  if(prevUrl) {
    const params = new URL(prevUrl.href);
    redirectParam = params.searchParams.get("redirect");
  }

  console.log(`"https://fittrack-server-api.onrender.com/api/${route}`)
  
  try {
    const response = await fetch(`"https://fittrack-server-api.onrender.com/api/${route}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      allData,
      redirectParam: prevUrl && redirectParam,
    })
  });
    
  const responseData = await response.json();

  if(responseData && responseData.redirectUrl) {
    sessionStorage.setItem("authToken", responseData.authToken);
    return window.location.replace(`${responseData.redirectUrl}`);
  } else {
    return responseData;
  }

  } catch(err) {
  console.error("Error:", err)
  throw err;
  }
}