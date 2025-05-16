/* Send form data to server */
export async function sendData(route, allData, prevUrl = null) {
  let redirectParam;

  if(prevUrl) {
    const params = new URL(prevUrl.href);
    redirectParam = params.searchParams.get("redirect");
  }
  
  try {
    const response = await fetch(`https://fittrack-server-api.onrender.com/${route}`, {
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