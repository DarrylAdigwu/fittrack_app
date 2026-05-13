import { checkString, capitalizeFirstLetter, 
  generateToken } from "../server-utils.js";
import { getUserByUsername, registerUser, authLogin, 
  deleteSession } from "../database/db.js";

/* Register User */
export async function registerUserController(req, res) {
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
}

/****
  Login Route / Start Session 
****/
export async function loginUserController(req, res) {
  const allLoginData = req.body.allData;
  const redirectParam = req.body.redirectParam;
  const username = allLoginData.username;
  const capUsername = capitalizeFirstLetter(username);
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
  const currentLocalTime = formatUsersLocalTime.format(new Date())
  console.log(currentLocalTime)
  

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

    console.log(req.session)

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
};

/****
 Logout Route 
****/
export async function logoutController(req, res) {
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
};