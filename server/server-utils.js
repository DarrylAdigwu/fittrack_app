import * as argon2 from "argon2";

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