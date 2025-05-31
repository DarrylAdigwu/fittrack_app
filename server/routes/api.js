import express from "express";
import { registerUser, getUserByUsername, authLogin, deleteSession } from "../database/db.js";
import { checkString, generateToken } from "../server-utils.js";

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
      });
    } else {
      return res.status(200).json({
        message: "Login Successful",
        redirectUrl: `${urlOrigin}/dashboard/${username}`,
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



export default router;