import mysql from "mysql2/promise";
import dotenv from "dotenv";
import * as argon2 from "argon2";
import { hashPassword, capitalizeAllLetters } from "../server-utils.js";

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
    if(capitalizeAllLetters(findUser[0].username) === capitalizeAllLetters(username) 
      && hashResult) {
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
};

/* Get all user sets for the day */
export async function getUsersSets(user_id, date) {
  const connection = await db.getConnection();
 
  try {

    // Check if date is valid
    if(date === `NaN-NaN-NaN` || date === null || date === NaN) {
      return null;
    }

    // Get stored workouts
    let getSetsQuery = `SELECT id, workout_id, set_number, weight, reps, completed, date FROM sets
            WHERE user_id = ?
            AND date = ?`;
    
    let getSetsInsert = [user_id, date];
  
    getSetsQuery = mysql.format(getSetsQuery, getSetsInsert);
  
    const [getDailySetsQuery] = await db.query(getSetsQuery);
    
    if(getDailySetsQuery.length === 0) {
      return null
    }
    return getDailySetsQuery;
  } catch(err) {
    console.error("Get user exercises error:", err);
  } finally {
    connection.release();
  }
};


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
};


/* Check for duplicate sets */
export async function checkSets(user_id, username, workout_id, workout, set_number, date) {
  const connection = await db.getConnection();

  try {
    let checkSetsQuery = `SELECT * FROM sets
            WHERE user_id = ?
            AND user_name = ?
            AND workout_id = ?
            AND exercise = ?
            AND set_number = ?
            AND date = ?`;

    let checkSetsInsert = [user_id, username, workout_id, workout, set_number, date];

    checkSetsQuery = mysql.format(checkSetsQuery, checkSetsInsert);

    const [setsQuery] = await db.query(checkSetsQuery);

    if(setsQuery[0]) {
      return true;
    } else {
      return false;
    }
  } catch(err) {
    console.error("check duplicate sets error:", err);
  } finally {
    connection.release();
  }
};


/* Store Sets */
export async function storeSets(user_id, username, workout_id, workout, set_number, weight, reps, completed, date) {
  const connection = await db.getConnection();

  try {
    // Check if entry already exists
    if(await checkSets(user_id, username, workout_id, workout, set_number, date)) {
      return `Set ${set_number} for ${workout} on ${date} already exists`;
    }

    // Store new sets
    let storeSetsQuery = `INSERT INTO sets
            (user_id, user_name, workout_id, exercise, set_number, weight, reps, completed, date)
            VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    let storeSetsInsert = [user_id, username, workout_id, workout, set_number, weight, reps, completed, date];

    storeSetsQuery = mysql.format(storeSetsQuery, storeSetsInsert);

    const setsQuery = await db.query(storeSetsQuery);

    return setsQuery;
  } catch(err) {
    console.error("Store sets error:", err);
  } finally {
    connection.release();
  }
};


/* Update workouts */
export async function updateUsersWorkouts(workout, muscleGroup, exercise_id, username) {
  const connection = await db.getConnection();

  try {
    // Update existing workout
    let updateWorkoutQuery = `UPDATE workouts
            SET exercise = ?, muscle_group = ?
            WHERE id = ? AND user_name = ?`;

    let updateWorkoutInsert = [workout, muscleGroup, exercise_id, username];

    updateWorkoutQuery = mysql.format(updateWorkoutQuery, updateWorkoutInsert);

    const updateQuery = await db.query(updateWorkoutQuery);

    return updateQuery;

  } catch(err) {
    console.error("Error updating workouts to the database:", err);
  } finally {
    connection.release();
  }
};


/* Update sets */
export async function updateWorkoutSets(set_number, weight, reps, completed, set_id, user_id) {
  const connection = await db.getConnection();

  try {
    // Update existing workout
    let updateSetQuery = `UPDATE sets
            SET set_number = ?, weight = ?, reps = ?, completed = ?
            WHERE user_id = ? AND id = ?`;

    let updateSetInsert = [set_number, weight, reps, completed, user_id, set_id];

    updateSetQuery = mysql.format(updateSetQuery, updateSetInsert);

    const updateWorkoutSetQuery = await db.query(updateSetQuery);

    return updateWorkoutSetQuery;

  } catch(err) {
    console.error("Error updating workouts to the database:", err);
  } finally {
    connection.release();
  }
};


/* Update set numbers */
export async function updateWorkoutSetNumber(set_number, set_id, user_id) {
  const connection = await db.getConnection();

  try {
    // Update existing workout
    let updateSetNumberQuery = `UPDATE sets
            SET set_number = ?
            WHERE user_id = ? AND id = ?`;

    let updateSetNumberInsert = [set_number, user_id, set_id];

    updateSetNumberQuery = mysql.format(updateSetNumberQuery, updateSetNumberInsert);

    const updateWorkoutSetNumberQuery = await db.query(updateSetNumberQuery);

    return updateWorkoutSetNumberQuery;

  } catch(err) {
    console.error("Error updating workouts to the database:", err);
  } finally {
    connection.release();
  }
};

/* Delete workouts */
export async function deleteWorkouts(user_id, date, exercise_id = null) {
  const connection = await db.getConnection();

  try {
    if(exercise_id !== null) {
      // Deleting all workouts
      let deleteSingleWorkoutQuery = `DELETE FROM workouts
              WHERE user_id = ?
              AND date = ?
              AND id = ?`;

      let deleteSingleWorkoutInsert = [user_id, date, exercise_id];

      deleteSingleWorkoutQuery = mysql.format(deleteSingleWorkoutQuery, deleteSingleWorkoutInsert);

      const deleteWorkoutQuery = await db.query(deleteSingleWorkoutQuery);

      return deleteWorkoutQuery;

    } else {
      // Deleting all workouts
      let deleteAllWorkoutsQuery = `DELETE FROM workouts
              WHERE user_id = ?
              AND date = ?`;

      let deleteAllWorkoutsInsert = [user_id, date];

      deleteAllWorkoutsQuery = mysql.format(deleteAllWorkoutsQuery, deleteAllWorkoutsInsert);

      const deleteAllQuery = await db.query(deleteAllWorkoutsQuery);

      return deleteAllQuery
    }
    
  } catch(err) {
    console.error(`Error deleting all workouts for this date this date`)
  } finally {
    connection.release();
  }
};


/* Delete sets */
export async function deleteWorkoutSets(user_id, set_id) {
  const connection = await db.getConnection();

  try {
    // Deleting all workouts
    let deleteSingleSetQuery = `DELETE FROM sets
            WHERE user_id = ?
            AND id = ?`;

    let deleteSingleSetInsert = [user_id, set_id];

    deleteSingleSetQuery = mysql.format(deleteSingleSetQuery, deleteSingleSetInsert);

    const deleteWorkoutSetQuery = await db.query(deleteSingleSetQuery);

    return deleteWorkoutSetQuery;
  } catch(err) {
    console.error(`Error deleting all workouts for this date this date`)
  } finally {
    connection.release();
  }
};


// Get all dates where the are scheduled workouts
export async function getAllDates(username) {
  const connection = await db.getConnection();

  try {
    // Query to get all dates for user
    let getAllDatesQuery = `SELECT DISTINCT date 
            FROM workouts
            WHERE user_name = ?`;
    
    // Parameters to add to query
    let getAllDatesInsert = [username];

    // Format escaped query
    getAllDatesQuery = mysql.format(getAllDatesQuery, getAllDatesInsert);

    // Send query to database
    const [getAllDates] = await db.query(getAllDatesQuery);

    // return values
    return getAllDates;

  } catch(err) {
    console.error("Error getting dates:", err);
  } finally {
    connection.release();
  }
};