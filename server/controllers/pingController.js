
/****
  Ping server
****/
export async function sendPingController(req, res) {
  console.log("Server pinged at:", new Date().toLocaleString());
  res.send({
    "check": "Server running"
  })
}