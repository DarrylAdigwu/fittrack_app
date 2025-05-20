/* Send form data to server */
export async function sendData(route, allData) {

  try {
    const response = await fetch(`https://fittrack-server-api.onrender.com/api/${route}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      allData,
    })
  });
    
  const responseData = await response.json();
  
  return responseData;

  } catch(err) {
  console.error("Error:", err)
  throw err;
  }
}