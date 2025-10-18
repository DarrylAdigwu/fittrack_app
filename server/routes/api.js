import express, { json } from "express";
import { registerUser, getUserByUsername, authLogin, deleteSession,
  getUsersExercises, storeExercise, storeSets, updateUsersWorkouts, 
  deleteWorkouts, getAllDates, getUsersSets, updateWorkoutSets, deleteWorkoutSets,
  updateWorkoutSetNumber } from "../database/db.js";
import { checkString, generateToken, requireAuth, formatDate, capitalizeFirstLetter } from "../server-utils.js";

// Create Router
const router = express.Router();


// Route to handle cron job
router.route("/ping")
.get( async (req, res) => {
  console.log("Server pinged at:", new Date().toLocaleString());
  res.send({
    "check": "Server running"
  })
});

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
})

/* Login Route / Start Session */
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
    };

    // Create auth tokens
    const authToken = await generateToken({username: req.session.user.username})
    const tokenUser = await generateToken({username: req.session.user.username});
    const tokenID = await generateToken({id: req.session.user.id});

    res.cookie("user-token", `${tokenUser}`, {
      maxAge: 1000 * 60 * 60,
      httpOnly: false,
      secure: false,
      sameSite: "lax",
    });

    res.cookie("id-token", `${tokenID}`, {
      maxAge: 1000 * 60 * 60,
      httpOnly: false,
      secure: false,
      sameSite: "lax",
    });

    // Send URL data based on redirectParam value
    if(prevParam) {
      return res.status(200).json({
        message: "Login Successfull",
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
})


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
})


/* Dashboard Route */
router.route("/dashboard/:username")
.get(requireAuth, async (req, res) => {
  if(req.session.user) {
    const user_id = req.session.user.id;
    const url = new URL(`${process.env.EXPRESS_DOMAIN}/api${req.url}`)
    const date = url.searchParams.get("date");
    const formattedDate = formatDate(date);
    
    // Get Stored workout and return to dashboard
    const getWorkout = await getUsersExercises(user_id, formattedDate);

    // Get stored sets and return to dashboard
    const getSets = await getUsersSets(user_id, formattedDate);

    return res.status(200).json({
        getWorkout,
        getSets,
    });
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
  const numOfSets = (Object.keys(allDashboardData).length - 3) / 4;
  const date = allDashboardData.displayDate;
  const newDateFormat = formatDate(date);

  if(req.method === "POST") {
    // Server side validation
    for(const [key, value] of Object.entries(allDashboardData)) {
      if((value === null || value === "" && !key.startsWith("setNumDisplay"))) {
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
    };
    
    // Check if form is a set form or workout form
    const setFormCheck = Object.keys(allDashboardData).some((key) => key.startsWith("workoutIdInput"));

    // If post is not a sets form 
    if(!setFormCheck) {
      //Send Workouts to database
      for(let i = 0; i < numOfWorkouts; i++) {
        const workout = allDashboardData[`workoutInput${i + 1}`];
        const muscleGroup = allDashboardData[`muscleGroupInput${i + 1}`];
        await storeExercise(user_id, username, workout, muscleGroup, newDateFormat);
      }
  
      // Retrieve Workout from database
      const getNewWorkout = await getUsersExercises(user_id, newDateFormat);
      
      // Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valid"},
        getNewWorkout,
      });
    };

    // If post is a sets form
    if(setFormCheck) {
      const setFormWorkoutId = Object.keys(allDashboardData).find((key) => key.startsWith("workoutIdInput"));
      const workoutName = Object.keys(allDashboardData).find((key) => key.startsWith("workoutName"));
      const workoutId = allDashboardData[`${setFormWorkoutId}`];
      const setWorkout = allDashboardData[`${workoutName}`];
      
      for(let i = 0; i < numOfSets; i++) {
        const setNumber = allDashboardData[`setNumDisplay${workoutId}-${i + 1}`];
        const weight = allDashboardData[`weightInput${workoutId}-${i + 1}`];
        const reps = allDashboardData[`repInput${workoutId}-${i + 1}`];
        const completed = allDashboardData[`setCheckbox${workoutId}-${i + 1}`];
        
        await storeSets(user_id, username, workoutId, setWorkout, setNumber, weight, reps, completed, newDateFormat);
      };

      // // Retrieve sets from database
      const getNewSets = await getUsersSets(user_id, newDateFormat);

      // Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valdi"},
        getNewSets
      });
    }
  }
})
.put(requireAuth, async (req, res) => {
  if(!req.session) {
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }
  
  const allUpdatedData = req.body.allData;
  const username = req.session.user.username;
  const user_id = req.session.user.id;
  const numOfWorkouts = (Object.entries(allUpdatedData).length - 1) / 3;
  const numOfSets = (Object.entries(allUpdatedData).length) / 4;
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
    };

    // Check if form is a set form or workout form
    const checkForSetForm = Object.keys(allUpdatedData).some((key) => key.startsWith("setIdInput"));
    
    if(!checkForSetForm) {
      for(let i = firstExercise_id; i < numOfWorkouts + firstExercise_id; i++) {
        const exercise_id = allUpdatedData[`idInput_${i}`];
        const updatedWorkout = allUpdatedData[`workoutInput${i}`];
        const updatedMuscleGroup = allUpdatedData[`muscleGroupInput${i}`];
        
        // Send updated workout from database
        await updateUsersWorkouts(updatedWorkout, updatedMuscleGroup, exercise_id, username);
      }
      
      // Retrieve new workout from database
      const getUpdatedWorkout = await getUsersExercises(user_id, newDateFormat)
      
      //Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valid"},
        getUpdatedWorkout
      });
    }

    if(checkForSetForm) {
      let setNumber = 0;
      const workoutId = Object.keys(allUpdatedData).find((key) => key.startsWith("setIdInput")).split("-")[1];

      for(let i = 0; i < numOfSets; i++) {
        const setId = allUpdatedData[`setIdInput-${workoutId}-${i + 1}`];
        const weight = allUpdatedData[`plannedWeight${workoutId}-${i + 1}`];
        const reps = allUpdatedData[`plannedReps${workoutId}-${i + 1}`];
        const completed = allUpdatedData[`plannedCheckboxes${workoutId}-${i + 1}`];
        
        // Update set number to avoid gaps in order
        if(setId === undefined || setId === null) {
          setNumber = setNumber;
        } else {
          setNumber += 1;
        }

        await updateWorkoutSets(setNumber, weight, reps, completed, setId, user_id);
      }

      // Retrive users workout sets
      const getUpdatedWorkoutSets = await getUsersSets(user_id, newDateFormat);

      //Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valid"},
        getUpdatedWorkoutSets
      });
    }
  }
})
.delete(requireAuth, async (req, res) => {
  if(!req.session) {
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }

  const allData = req.body.allData;
  const allDeleteData = allData.dataDelete;
  const allUpdateData = allData.dataUpdate;
  const username = req.session.user.username;
  const user_id = req.session.user.id;
  const date = allData.displayDate;
  const newDateFormat = formatDate(date);

  if(req.method === "DELETE") {
    // Check type of form
    const checkForDeleteSetForm = Object.keys(allData).some((key) => key.startsWith("dataDelete"));
    
    // Delete data from workouts
    if(!checkForDeleteSetForm) {
      // Delete workouts using thier id and user id
      for(const [key, value] of Object.entries(allData)) {
        if(key.startsWith("checkbox")) {
          const workoutId = allData[`${key}`];

          await deleteWorkouts(user_id, newDateFormat, workoutId)
        }
      }
      
      // Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valid"},
      });
    }
    
    // Delete data from workout sets and update set numbers
    if(checkForDeleteSetForm) {
        // Array to hold deleted sets id's
        let deletedIds = [];

        // Delete sets using thier id and user id
        for(const [key, value] of Object.entries(allDeleteData)) {
          if(key.startsWith("deleteSetCheckbox")) {
            const setId = allDeleteData[`${key}`];
            deletedIds.push(setId);

            await deleteWorkoutSets(user_id, setId);
          }
        }
        
      const numOfUpdateSets = Object.entries(allUpdateData).length;
      const workoutId = Object.keys(allUpdateData).find((key) => key.startsWith("setIdInput")).split("-")[1];
      let setNumber = 0;

      for(let i = 0; i < numOfUpdateSets; i++) {
        // Get id for each set
        let setId = allUpdateData[`setIdInput-${workoutId}-${i + 1}`];
        
        // Check if id was apart of deleted batch
        if(deletedIds.includes(setId)) {
          setId = null;
        } 

        // Update set number to avoid gaps in storage order
        if(setId === undefined || setId === null) {
          setNumber = setNumber;
        } else {
          setNumber += 1;
          await updateWorkoutSetNumber(setNumber, setId, user_id);
        }
      }

      // Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valid"},
      });
    }
  }
});


// Calendar component api
router.route("/calendar")
.get(requireAuth, async (req, res) => {
  if(!req.session) {
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }

  const user_id = req.session.user.id;
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
});

export default router;