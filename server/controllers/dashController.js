import { formatDate, checkString, capitalizeFirstLetter, 
  requireAuth } from "../server-utils.js";
import { getUsersExercises, getUsersSets, 
  updateUsersWorkouts, updateWorkoutSets, storeExercise, 
  storeSets, deleteWorkouts, deleteWorkoutSets, 
  updateWorkoutSetNumber } from "../database/db.js";


/****
  Get Workouts Stored 
****/
export async function getWorkoutsController(req, res) {
  if(req.session.user) {
    const user_id = req.session.user.id;
    const url = new URL(`${process.env.SERVER_DOMAIN}/api${req.url}`)
    const date = url.searchParams.get("date");
    const formattedDate = formatDate(date);

    // Get Stored workout and return to dashboard
    const getWorkout = await getUsersExercises(user_id, formattedDate);

    // Get stored sets and return to dashboard
    const getSets = await getUsersSets(user_id, formattedDate);

    return res.status(200).json({
        getWorkout,
        getSets,
    });
  }
};


/****
  Post Workouts 
****/
export async function postWorkoutsController(req, res) {
  if(!req.session) {
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }

  const allDashboardData = req.body.allData;
  const user_id = req.session.user.id;
  const username = req.session.user.username;
  const numOfWorkouts = (Object.keys(allDashboardData).length - 1) / 2;
  const numOfSets = (Object.keys(allDashboardData).length - 3) / 4;
  const date = allDashboardData.displayDate;
  const newDateFormat = formatDate(date);

  if(req.method === "POST") {
    // Server side validation
    for(const [key, value] of Object.entries(allDashboardData)) {
      if((value === null || value === "" && !key.startsWith("setNumDisplay"))) {
        return res.status(400).json({
          serverError: {"invalid": "Visible fields must have an answer"}
        });
      }

      if(key.startsWith("setInput") && isNaN(value)) {
        return res.status(400).json({
          serverError: {"invalid": "Rep fields must be a number"}
        });
      }

      if(key.startsWith("repInput") && isNaN(value)) {
        return res.status(400).json({
          serverError: {"invalid": "Rep fields must be a number"}
        });
      }

      if(key !== "displayDate" && checkString(value) === null) {
        return res.status(400).json({
          serverError: {"invalid": "Inputs cannot contain special characters or spaces"}
        });
      }
    };

    // Check if form is a set form or workout form
    const setFormCheck = Object.keys(allDashboardData).some((key) => key.startsWith("workoutIdInput"));

    // If post is not a sets form 
    if(!setFormCheck) {
      //Send Workouts to database
      for(let i = 0; i < numOfWorkouts; i++) {
        let workout = allDashboardData[`workoutInput${i + 1}`];
        let muscleGroup = allDashboardData[`muscleGroupInput${i + 1}`];
        workout = capitalizeFirstLetter(workout);
        muscleGroup = capitalizeFirstLetter(muscleGroup);

        await storeExercise(user_id, username, workout, muscleGroup, newDateFormat);
      }
  
      // Retrieve Workout from database
      const getNewWorkout = await getUsersExercises(user_id, newDateFormat);
      
      // Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valid"},
        getNewWorkout,
      });
    };

    // If post is a sets form
    if(setFormCheck) {
      const setFormWorkoutId = Object.keys(allDashboardData).find((key) => key.startsWith("workoutIdInput"));
      const workoutName = Object.keys(allDashboardData).find((key) => key.startsWith("workoutName"));
      const workoutId = allDashboardData[`${setFormWorkoutId}`];
      const setWorkout = allDashboardData[`${workoutName}`];
      
      for(let i = 0; i < numOfSets; i++) {
        const setNumber = allDashboardData[`setNumDisplay${workoutId}-${i + 1}`];
        const weight = allDashboardData[`weightInput${workoutId}-${i + 1}`];
        const reps = allDashboardData[`repInput${workoutId}-${i + 1}`];
        const completed = allDashboardData[`setCheckbox${workoutId}-${i + 1}`];
        
        await storeSets(user_id, username, workoutId, setWorkout, setNumber, weight, reps, completed, newDateFormat);
      };

      // // Retrieve sets from database
      const getNewSets = await getUsersSets(user_id, newDateFormat);

      // Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valdi"},
        getNewSets
      });
    }
  }
}


/****
  Update Workouts 
****/
export async function updateWorkoutsController(req, res) {
  if(!req.session) {
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }
  
  const allUpdatedData = req.body.allData;
  const username = req.session.user.username;
  const user_id = req.session.user.id;
  const numOfWorkouts = (Object.entries(allUpdatedData).length - 1) / 3;
  const numOfSets = (Object.entries(allUpdatedData).length) / 4;
  const date = allUpdatedData.displayDate;
  const newDateFormat = formatDate(date);
  const firstExercise_id = Number(Object.entries(allUpdatedData)[1][0].split("_")[1]);
 
  if(req.method === "PUT") {
    // Server side validation
    for(const [key, value] of Object.entries(allUpdatedData)) {
      if(value === null || value === "") {
        return res.status(400).json({
          serverError: {"invalid": "Visible fields must have an answer"}
        });
      }

      if(key.startsWith("setInput") && isNaN(value)) {
        return res.status(400).json({
          serverError: {"invalid": "Rep fields must be a number"}
        });
      }

      if(key.startsWith("repInput") && isNaN(value)) {
        return res.status(400).json({
          serverError: {"invalid": "Rep fields must be a number"}
        });
      }

      if(key !== "displayDate" && checkString(value) === null) {
        return res.status(400).json({
          serverError: {"invalid": "Inputs cannot contain special characters or spaces"}
        });
      }
    };

    // Check if form is a set form or workout form
    const checkForSetForm = Object.keys(allUpdatedData).some((key) => key.startsWith("setIdInput"));
    
    if(!checkForSetForm) {
      for(let i = firstExercise_id; i < numOfWorkouts + firstExercise_id; i++) {
        const exercise_id = allUpdatedData[`idInput_${i}`];
        let updatedWorkout = allUpdatedData[`workoutInput${i}`];
        let updatedMuscleGroup = allUpdatedData[`muscleGroupInput${i}`];
        updatedWorkout = capitalizeFirstLetter(updatedWorkout);
        updatedMuscleGroup = capitalizeFirstLetter(updatedMuscleGroup);
        
        // Send updated workout from database
        await updateUsersWorkouts(updatedWorkout, updatedMuscleGroup, exercise_id, username);
      }
      
      // Retrieve new workout from database
      const getUpdatedWorkout = await getUsersExercises(user_id, newDateFormat)
      
      //Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valid"},
        getUpdatedWorkout
      });
    }

    if(checkForSetForm) {
      let setNumber = 0;
      const workoutId = Object.keys(allUpdatedData).find((key) => key.startsWith("setIdInput")).split("-")[1];
      
      for(let i = 0; i < numOfSets; i++) {
        const setId = allUpdatedData[`setIdInput-${workoutId}-${i + 1}`];
        const weight = allUpdatedData[`plannedWeight${workoutId}-${i + 1}`];
        const reps = allUpdatedData[`plannedReps${workoutId}-${i + 1}`];
        const completed = allUpdatedData[`plannedCheckboxes${workoutId}-${i + 1}`];
        
        // Update set number to avoid gaps in order
        if(setId === undefined || setId === null) {
          setNumber = setNumber;
        } else {
          setNumber += 1;
        }

        await updateWorkoutSets(setNumber, weight, reps, completed, setId, user_id);
      }

      // Retrive users workout sets
      const getUpdatedWorkoutSets = await getUsersSets(user_id, newDateFormat);

      //Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valid"},
        getUpdatedWorkoutSets
      });
    }
  }
};


/****
  Delete Workouts
****/
export async function deleteWorkoutsController(req, res) {
  if(!req.session) {
    return res.status(401).json({
        invalid: "Unauthorized", 
    });
  }

  const allData = req.body.allData;
  const allDeleteData = allData.dataDelete;
  const allUpdateData = allData.dataUpdate;
  const user_id = req.session.user.id;
  const date = allData.displayDate;
  const newDateFormat = formatDate(date);

  if(req.method === "DELETE") {
    // Check type of form
    const checkForDeleteSetForm = Object.keys(allData).some((key) => key.startsWith("dataDelete"));
    
    // Delete data from workouts
    if(!checkForDeleteSetForm) {
      // Delete workouts using thier id and user id
      for(const [key, value] of Object.entries(allData)) {
        if(key.startsWith("checkbox")) {
          const workoutId = allData[`${key}`];

          await deleteWorkouts(user_id, newDateFormat, workoutId)
        }
      }
      
      // Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valid"},
      });
    }
    
    // Delete data from workout sets and update set numbers
    if(checkForDeleteSetForm) {
        // Array to hold deleted sets id's
        let deletedIds = [];

        // Delete sets using thier id and user id
        for(const [key, value] of Object.entries(allDeleteData)) {
          if(key.startsWith("deleteSetCheckbox")) {
            const setId = allDeleteData[`${key}`];
            deletedIds.push(setId);

            await deleteWorkoutSets(user_id, setId);
          }
        }
        
      const numOfUpdateSets = Object.entries(allUpdateData).length;
      const workoutId = Object.keys(allUpdateData).find((key) => key.startsWith("setIdInput")).split("-")[1];
      let setNumber = 0;

      for(let i = 0; i < numOfUpdateSets; i++) {
        // Get id for each set
        let setId = allUpdateData[`setIdInput-${workoutId}-${i + 1}`];
        
        // Check if id was apart of deleted batch
        if(deletedIds.includes(setId)) {
          setId = null;
        } 

        // Update set number to avoid gaps in storage order
        if(setId === undefined || setId === null) {
          setNumber = setNumber;
        } else {
          setNumber += 1;
          await updateWorkoutSetNumber(setNumber, setId, user_id);
        }
      }

      // Return valid message
      return res.status(200).json({
        serverCheck: {"valid": "Data is valid"},
      });
    }
  }
};