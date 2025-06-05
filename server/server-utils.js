import * as argon2 from "argon2";
import jwt from "jsonwebtoken";

export function checkString(str) {
  const regex = /^[a-zA-Z0-9\s]*$/;
  const match = str.match(regex);
  return match;
}

// Hash password with argon2
export async function hashPassword(password) {
  try{
    const hash = await argon2.hash(password);
    return hash;
  } catch(err) {
    console.error("Error:", err)
  }
}

// JSONWebToken
export async function generateToken(payload) {
  try {
    return jwt.sign(payload, `${process.env.JWT_TOKEN}`, {expiresIn: `1h`});
  } catch(err) {
    console.error("Error creating web token");
  }
}


// Authenticator Token
export async function verifyToken(token) {
  try {
    if(token === "null") {
      return null
    }
    let verified = jwt.verify(`${token}`, `${process.env.JWT_TOKEN}`)
    return verified["username"];
  } catch (err) {
    console.error("Error with auth Token:", err);
    return null;
  }
}


// Authenticate Middleware
export async function requireAuth (req, res, next) {
  
  try {
    const authToken = req["headers"].authorization.split(" ")[1];
    const decodedToken = await verifyToken(`${authToken}`);

    if(authToken === "null") {
      return res.status(401).json({
        invalid: "Unauthorized", 
      });
    }

    if(decodedToken === null) {
      return res.status(401).json({
        invalid: "Unauthorized", 
      });
    }

    if(decodedToken === req.session.user.username) {
      next();
    }

  } catch(err) {
    console.error("Authentication failed:", err)
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }
}


// Format date 
export function formatDate(date) {
  const passedInDate = Date.parse(date)
  const plannedDate = new Date(passedInDate)
  
  const year = plannedDate.getFullYear();
  const month = String(plannedDate.getMonth() + 1).padStart(2, '0');
  const day = String(plannedDate.getDate()).padStart(2, '0');
  const newFormat = `${year}-${month}-${day}`;
  
  return newFormat;
}