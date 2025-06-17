import express from "express";
import { registerUser, getUserByUsername, authLogin, deleteSession, 
  getUsersExercises, storeExercise, updateUsersWorkouts, deleteWorkouts } from "../database/db.js";
import { checkString, generateToken, requireAuth, formatDate, capitalizeFirstLetter } from "../server-utils.js";

// Create Router
const router = express.Router();

/* Register route */
router.route("/register")
.post( async (req, res) => {
  const allRegisterData = req.body.allData;
  const username = allRegisterData.username;
  const password = allRegisterData.password;
  const confirmPass = allRegisterData["confirm-password"];
 
  if(req.method === "POST") {

    // Validate register form
    if(!username) {
      return res.json({
        serverError: {"invalidUsername": "Username is required"}
      });
    }
    
    if(checkString(username) === null) {
      return res.json({
        serverError: {"invalidChar": "Username cannot not contain special characters"}
      });
    }
    
    if(!password) {
      return res.json({
        serverError: {"invalidPassword": "Password is required"}
      });
    }
    
    if(password !== confirmPass) {
      return res.json({
        serverError: {"invalidConfirmPass": "Passwords must match"}
      });
    }

    if(await getUserByUsername(username, "username") !== false) {
      return res.json({
        serverError: {"invalidUsername": "Username already exists"}
      })
    }

    // If registration is valid
    try {
      await registerUser(username, password);
    } catch (err) {
      console.error("Error:", err)
    }

    //Return response to client for page redirect
    return res.status(200).json({
      serverCheck: {"valid": "Registration is valid"}
    });
  }
});


/* Login Route & Start Session */
router.route("/login")
.post(async (req, res) => {
  const allLoginData = req.body.allData;
  const redirectParam = req.body.redirectParam;
  const username = allLoginData.username;
  const password = allLoginData.password;
  const loginUser = await authLogin(username, password);

  const prevUrl = redirectParam.prevUrl;
  const prevParam = redirectParam.prevParam;
  const urlOrigin = new URL(prevUrl).origin;

  const usersLanguage = req.headers["accept-language"].split(",")[0];
  const formatUsersLocalTime = new Intl.DateTimeFormat(usersLanguage, {
    weekday: "short", 
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const currentLocalTime = formatUsersLocalTime.format(new Date());

  if(req.method === "POST") {

    // Validate login form
    if(!username) {
      return res.status(400).json({
        serverError: {"invalidUsername": "Username is required"}
      });
    };

    if(!password) {
      return res.status(400).json({
        serverError: {"invalidPassword": "Password is required"}
      });
    };

    if(checkString(username) === null) {
      return res.status(400).json({
        serverError: {"invalidUsername": "Invalid username"}
      });
    };

    if(loginUser === "Invalid username") {
      return res.status(401).json({
        serverError: {"unauthUsername": "Username does not exist"}
      });
    };

    if(loginUser === "Password does not match") {
      return res.status(401).json({
        serverError: {"unauthPassword": "Password does not match"}
      });
    };

    // Start Session
    if(loginUser) {
      const user_id = await getUserByUsername(username, "id");
      req.session.user = {
        id: user_id,
        username: username
      }
    }

    // Create auth tokens
    const authToken = await generateToken({username: req.session.user.username});
    const tokenUser = await generateToken({username: req.session.user.username});
    const tokenID = await generateToken({id: req.session.user.id});

    res.cookie("user-token", `${tokenUser}`, {
      maxAge: 1000 * 60 * 60,
      httpOnly: false,
      secure: true,
      sameSite: "none",
      domain: ".fittracker.us",
    });

    res.cookie("id-token", `${tokenID}`, {
      maxAge: 1000 * 60 * 60,
      httpOnly: false,
      secure: true,
      sameSite: "none",
      domain: ".fittracker.us",
    });

    // Send URL data based on redirectParam value
    if(prevParam) {
      return res.status(200).json({
        message: "Login Successful",
        redirectUrl: `${urlOrigin}${prevParam}/${username}?date=${currentLocalTime}`,
        authToken: authToken
      });
    } else {
      return res.status(200).json({
        message: "Login Successful",
        redirectUrl: `${urlOrigin}/dashboard/${username}?date=${currentLocalTime}`,
        authToken: authToken
      });
    }
  }
});


/* Logout Route */
router.route("/logout")
.delete(async (req, res) => {
  // Remove session from DB
  await deleteSession(req.body.username)
  if(req.session) {
    await new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if(err) {
          reject(err)
          return;
        } else {
          resolve();
          res.clearCookie('connect.sid')
          res.status(200).json({ success: "Logout successful" })
        }
      });
    })
  } else {
    return;
  }
});


/* Dashboard Route */
router.route("/dashboard/:username")
.get(requireAuth, async (req, res) => {
  if(req.session.user) {
    const user_id = req.session.user.id;
    const url = new URL(`${process.env.SERVER_DOMAIN}/api${req.url}`)
    const date = url.searchParams.get("date");
    const formattedDate = formatDate(date);

    // Get Stored workout and return to dashboard
    const getWorkout = await getUsersExercises(user_id, formattedDate);
    return res.status(200).json({
        getWorkout,
    })
  }
})
.post(requireAuth, async (req, res) => {
  if(!req.session) {
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }

  const allDashboardData = req.body.allData;
  const user_id = req.session.user.id;
  const username = req.session.user.username;
  const numOfWorkouts = (Object.keys(allDashboardData).length - 1) / 3;
  const date = allDashboardData.displayDate;
  const newDateFormat = formatDate(date);


  if(req.method === "POST") {
    // Server side validation
    for(const [key, value] of Object.entries(allDashboardData)) {
      if(value === null || value === "") {
        return res.status(400).json({
          serverError: {"invalid": "Visible fields must have an answer"}
        });
      }

      if(key.startsWith("setInput") && isNaN(value)) {
        return res.status(400).json({
          serverError: {"invalid": "Rep fields must be a number"}
        });
      }

      if(key.startsWith("repInput") && isNaN(value)) {
        return res.status(400).json({
          serverError: {"invalid": "Rep fields must be a number"}
        });
      }

      if(key !== "displayDate" && checkString(value) === null) {
        return res.status(400).json({
          serverError: {"invalid": "Inputs cannot contain special characters or spaces"}
        });
      }
    }

    // Send workouts to database
    for(let i = 0; i < numOfWorkouts; i++) {
      const workout = capitalizeFirstLetter(allDashboardData[`workoutInput${i + 1}`]);
      const muscleGroup = capitalizeFirstLetter(allDashboardData[`muscleGroupInput${i + 1}`]);
      const set = allDashboardData[`setInput${i + 1}`];
      const rep = allDashboardData[`repInput${i + 1}`];
      await storeExercise(user_id, username, workout, muscleGroup, set, rep, newDateFormat);
    }

    // Retrieve Workout from database
    const getNewWorkout = await getUsersExercises(user_id, newDateFormat);

    // Return valid message
    return res.status(200).json({
      serverCheck: {"valid": "Data is valid"},
      getNewWorkout,
    });
  }
})
.put(async (req, res) => {
  if(!req.session) {
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }
  
  const allUpdatedData = req.body.allData;
  const username = req.session.user.username;
  const user_id = req.session.user.id;
  const numOfWorkouts = (Object.entries(allUpdatedData).length - 1) / 5;
  const date = allUpdatedData.displayDate;
  const newDateFormat = formatDate(date);
  const firstExercise_id = Number(Object.entries(allUpdatedData)[1][0].split("_")[1]);
  
  if(req.method === "PUT") {
    // Server side validation
    for(const [key, value] of Object.entries(allUpdatedData)) {
      if(value === null || value === "") {
        return res.status(400).json({
          serverError: {"invalid": "Visible fields must have an answer"}
        });
      }

      if(key.startsWith("setInput") && isNaN(value)) {
        return res.status(400).json({
          serverError: {"invalid": "Rep fields must be a number"}
        });
      }

      if(key.startsWith("repInput") && isNaN(value)) {
        return res.status(400).json({
          serverError: {"invalid": "Rep fields must be a number"}
        });
      }

      if(key !== "displayDate" && checkString(value) === null) {
        return res.status(400).json({
          serverError: {"invalid": "Inputs cannot contain special characters or spaces"}
        });
      }
    }

    for(let i = firstExercise_id; i < numOfWorkouts + firstExercise_id; i++) {
      const exercise_id = allUpdatedData[`idInput_${i}`];
      const updatedWorkout = allUpdatedData[`workoutInput${i}`];
      const updatedMuscleGroup = allUpdatedData[`muscleGroupInput${i}`];
      const updatedSets = allUpdatedData[`setInput${i}`];
      const updatedReps = allUpdatedData[`repInput${i}`];

      // Send updated workout from database
      await updateUsersWorkouts(updatedWorkout, updatedMuscleGroup, updatedSets, updatedReps, exercise_id, username);
    }

    // Retrieve new workout from database
    const getUpdatedWorkout = await getUsersExercises(user_id, newDateFormat)

    // Return valid message
    return res.status(200).json({
      serverCheck: {"valid": "Data is valid"},
      getUpdatedWorkout
    });
  }

})
.delete(async (req, res) => {
  if(!req.session) {
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }

  const allDeleteData = req.body.allData;
  const username = req.session.user.username;
  const user_id = req.session.user.id;
  const numOfWorkouts = (Object.entries(allDeleteData).length - 1) / 5;
  const date = allDeleteData.displayDate;
  const newDateFormat = formatDate(date);
  const firstExercise_id = Number(Object.entries(allDeleteData)[1][0].split("_")[1]);
  
  const singleWorkoutId = allDeleteData.submitIndividual;
  const singleWorkoutDate = allDeleteData.workoutDate;
  const singleDateFormat = formatDate(singleWorkoutDate);

  if(req.method === "DELETE") {
    if(singleWorkoutId) {

      // Return valid message
    return res.status(200).json({
      serverCheck: {
        singleDateFormat: singleDateFormat,
        singleWorkoutDate: singleWorkoutDate,
        singleWorkoutId: singleWorkoutId,
      },
    });
      // Delete single workout
      await deleteWorkouts(user_id, singleDateFormat, singleWorkoutId);

    }

    if(!singleWorkoutId) {

      // Return valid message
    return res.status(200).json({
      serverCheck: {
        singleDateFormat: singleDateFormat,
        singleWorkoutDate: singleWorkoutDate,
        singleWorkoutId: singleWorkoutId,
        allDeleteData: allDeleteData,
        dataData: date,
        newDateFormat: newDateFormat
      },
    });
      // Delete all workouts from given date
      await deleteWorkouts(user_id, newDateFormat)

    }

  }
})

export default router;