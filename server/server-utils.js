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