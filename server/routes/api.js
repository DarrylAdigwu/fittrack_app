import express from "express";
import { checkString } from "../utils.js";
import { registerUser, getUserByUsername } from "../database/db.js";

// Create Router
const router = express.Router();

/* Register route */
router.route("/register")
.post(async (req, res) => {
  const allRegisterData = req.body.allData;
  const username = allRegisterData.username;
  const password = allRegisterData.password;
  const confirmPass = allRegisterData["confirm-password"];
  
  if(req.method === 'POST') {
    
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
    try{
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

export default router;