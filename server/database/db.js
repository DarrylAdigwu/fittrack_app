import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { hashPassword } from "../utils.js";

/* Configure .env files */
dotenv.config();

/* Configure Database */
export const db = mysql.createPool({
  host: "database-fittrack.cvsqgq8aamla.us-west-2.rds.amazonaws.com",
  port: 3306,
  user: "admin",
  password: "fitTrackdb",
  database: "fittrackDB",
  connectionLimit: 10,
  waitForConnections: true,
  maxIdle: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});


/* Register user to database */
export async function registerUser(username, password) {
  const connection = await db.getConnection();
  
  try{
    const hash = await hashPassword(password);
    const register = await db.query(`INSERT INTO users (username, hash)
            VALUES(?, ?)`, [username, hash]);
    return register;
  } catch (err) {
    console.error("Register user error:", err)
  } finally {
    connection.release();
  }
};

// Get user by username
export async function getUserByUsername(username, info = "id") {
  const connection = await db.getConnection();
  
  try {
    // SQL query statement
    let getUserQuery = `SELECT id, username 
            FROM users 
            WHERE username = ?`;
    
    // Parameters to be added to query
    let getUserInsert = [username];
    
    // Format escaped query
    getUserQuery = mysql.format(getUserQuery, getUserInsert);
    
    const [userQuery] = await db.query(getUserQuery);
    
    console.log(userQuery)
    if(!userQuery[0]) {
      return false
    } 
    if(info === "username") {
      return userQuery[0].username
    } else {
      return userQuery[0].id
    }
  } catch(err) {
    console.error("Get user by username error:", err);
  } finally {
    connection.release();
  }
}