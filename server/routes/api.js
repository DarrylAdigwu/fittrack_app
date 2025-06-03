import express from "express";
import { registerUser, getUserByUsername, authLogin, deleteSession, 
  getUsersExercises, storeExercise } from "../database/db.js";
import { checkString, generateToken, requireAuth, formatDate } from "../server-utils.js";

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
        redirectUrl: `${urlOrigin}${prevParam}/${username}`,
        authToken: authToken
      });
    } else {
      return res.status(200).json({
        message: "Login Successful",
        redirectUrl: `${urlOrigin}/dashboard/${username}`,
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
    const url = new URL(`https://api.stage.fittracker.us/api${req.url}`)
    const date = url.searchParams.get("date");
    const formattedDate = formatDate(date);

    // Get Stored workout and return to dashboard
    const getWorkout = await getUsersExercises(user_id, formattedDate);
    return res.status(200).json({
        getWorkout,
    })
  }
})
.post(async (req, res) => {
  const allDashboardData = req.body.allData;
  const id = req.session.user.id;
  const username = req.session.user.username;
  const numOfWorkouts = (Object.keys(allDashboardData).length - 1) / 3;
  const date = allDashboardData.displayDate;

  if(req.method = "POST") {
    // Server side validation
    for(const [key, value] of Object.entries(allDashboardData)) {
      if(value === null || value === "") {
        return res.status(400).json({
          serverError: {"invalid": "Visible fields must have an answer"}
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

    const newDateFormat = formatDate(date);

    // Send workouts to database
    for(let i = 0; i < numOfWorkouts; i++) {
      const workout = allDashboardData[`workoutInput${i + 1}`];
      const muscleGroup = allDashboardData[`muscleGroupInput${i + 1}`];
      const rep = allDashboardData[`repInput${i + 1}`];
      await storeExercise(id, username, workout, muscleGroup, rep, newDateFormat);
    }

    // Return valid message
    return res.status(200).json({
      serverCheck: {"valid": "Data is valid"}
    });
  }
})


export default router;