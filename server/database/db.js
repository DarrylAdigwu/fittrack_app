import mysql from "mysql2/promise";
import dotenv from "dotenv";
import * as argon2 from "argon2";
import { hashPassword } from "../server-utils.js";

/* Configure .env files */
dotenv.config();

/* Configure Database */
export const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
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
}