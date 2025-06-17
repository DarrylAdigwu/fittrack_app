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
};


/* Authenticate user login */
export async function authLogin(username, password) {
  const connection = await db.getConnection();
  
  try {
    let hashResult;
    let findUser;
  
    // Search for matching username
    try {
      [findUser] = await db.query(
              `SELECT username, hash
              FROM users 
              WHERE username = ?`, 
              [username]
      );
      
    } catch (err) {
      console.error("Error:" , err)
    }
  
    
    if(!findUser[0]) {
      return "Invalid username";
    } 
  
    // Verify password
    try {
      if(await argon2.verify(findUser[0].hash, password)) {
        hashResult =  true;
      } else {
        hashResult =  false;
      }
    } catch(err) {
      console.error('Error:', err)
    }
  
    // Return boolean based on information
    if(findUser[0].username === username && hashResult) {
      return true;
    } else if(!hashResult){
      return "Password does not match";
    } 
  } catch(err) {
    console.error("Get user by username error:", err);
  } finally {
    connection.release();
  }
};


/* Delete session */
export async function deleteSession(username) {
  const connection = await db.getConnection();

  try {
    // Delete session 
    let sessionQuery = `DELETE FROM sessions WHERE ? = JSON_EXTRACT(data, '$.user.username')`;
    let sessionInsert = [username];
    sessionQuery = mysql.format(sessionQuery, sessionInsert);
    const [deleteSession] = await db.query(sessionQuery);
  } catch(err) {
    console.error("Error with delete session in database:", err);
  } finally {
    connection.release();
  }
}


/* Get all user workouts for the day */
export async function getUsersExercises(user_id, date) {
  const connection = await db.getConnection();

  try {
    
    // Check if date is valid
    if(date === "NaN-NaN-NaN" || date === null || date === NaN) {
      return null;
    }

    // Get stored workouts
    let getWorkoutsQuery = `SELECT id, exercise, muscle_group, sets, reps, date FROM workouts
            WHERE user_id = ?
            AND date = ?`;
    
    let getWorkoutsInsert = [user_id, date];
  
    getWorkoutsQuery = mysql.format(getWorkoutsQuery, getWorkoutsInsert);
  
    const [getExercisesQuery] = await db.query(getWorkoutsQuery);
    
    if(getExercisesQuery.length === 0) {
      return null
    }
    return getExercisesQuery;
  } catch(err) {
    console.error("Get user exercises error:", err);
  } finally {
    connection.release();
  }
}


/* Search for duplicate workouts */
export async function checkWorkouts(user_id, username, workout, date) {
  const connection = await db.getConnection();
  
  try {
    let checkWorkoutsQuery = `Select * FROM workouts 
            WHERE user_id = ? 
            AND user_name = ? 
            AND exercise = ? 
            AND date = ?`;
    
    let checkWorkoutsInsert = [user_id, username, workout, date];
  
    checkWorkoutsQuery = mysql.format(checkWorkoutsQuery, checkWorkoutsInsert);
  
    const [workoutsQuery] = await db.query(checkWorkoutsQuery);
    if(workoutsQuery[0]) {
      return true;
    } else {
      return false;
    }
  } catch(err) {
    console.error("Check for duplicate workouts error:", err);
  } finally {
    connection.release();
  }
}


/* Store workout */
export async function storeExercise(user_id, username, workout, muscleGroup, sets, reps, date) {
  const connection = await db.getConnection();

  try {
    // Check if entry already exists
    if(await checkWorkouts(user_id, username, workout, date)) {
      return "Workout already exists";
    }
  
    // Store new workouts
    let storeExerciseQuery = `INSERT INTO workouts 
            (user_id, user_name, exercise, muscle_group, sets, reps, date)
            VALUES(?, ?, ?, ?, ?, ?, ?)`;
    
    let storeExerciseInsert = [user_id, username, workout, muscleGroup, sets, reps, date];
  
    storeExerciseQuery = mysql.format(storeExerciseQuery, storeExerciseInsert);
  
    const exerciseQuery = await db.query(storeExerciseQuery);
  
    return exerciseQuery;
  } catch(err) {
    console.error("Store exercise error:", err);
  } finally {
    connection.release();
  }
}


/* Update workouts */
export async function updateUsersWorkouts(workout, muscleGroup, sets, reps, exercise_id, username) {
  const connection = await db.getConnection();

  try {
    // Update existing workout
    let updateWorkoutQuery = `UPDATE workouts
            SET exercise = ?, muscle_group = ?, sets = ?, reps = ?
            WHERE id = ? AND user_name = ?`;

    let updateWorkoutInsert = [workout, muscleGroup, sets, reps, exercise_id, username];

    updateWorkoutQuery = mysql.format(updateWorkoutQuery, updateWorkoutInsert);

    const updateQuery = await db.query(updateWorkoutQuery);

    return updateQuery;

  } catch(err) {
    console.error("Error updating workouts to the database:", err);
  } finally {
    connection.release();
  }
}


/* Delete Single Workout */
export async function deleteSingleWorkout(user_id, date, exercise_id) {
  const connection = await db.getConnection();

  try {
    let deleteSingleWorkoutQuery = `DELETE FROM workouts
            WHERE user_id = ? AND date = ? AND id = ?`;

    let deleteSingleWorkoutInsert = [user_id, date, exercise_id];

    deleteSingleWorkoutQuery = mysql.format(deleteSingleWorkoutQuery, deleteSingleWorkoutInsert);

    const deleteWorkoutQuery = await db.query(deleteSingleWorkoutQuery);

    return deleteWorkoutQuery

  } catch(err) {
    console.error("Error delete individual workout");
  } finally {
    connection.release();
  }
}