import { getAllDates } from "../database/db.js";
import { formatDate } from "../server-utils.js";


/****
  Calendar Component API
****/
export async function getCalendarController(req, res) {
  if(!req.session) {
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }

  const username = req.session.user.username;

  // Get all dates where there is a workout
  const getDates = await getAllDates(username);

  const allDates = [];

  getDates.map((date) => {
    const formatAllDates = formatDate(new Date(date.date));
    allDates.push(formatAllDates)
  })

 

  // Return valid message
  return res.status(200).json({
    allDates,
  });
};