import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import apiRouter from "./routes/api.js"
import { db } from "./database/db.js";

// Create Web App
const server = express();

// Configure .env
dotenv.config();

// Middleware for web security
server.use(helmet());

// Middleware for parsing cookies
server.use(cookieParser());

// Middleware for proxy server
server.set("trust proxy", 1);

// Middleware for cross-origin
server.use(cors({
  origin: process.env.DOMAIN,
  credentials: true,
}));

// Log http request
server.use(morgan("dev"));

// Configure middleware for JSON, public folder, and parsing body
server.use(express.static("public"));
server.use(express.json());
server.use(express.urlencoded({extended:true}));

//Create SQL connection pool
const SQLStore = MySQLStore(session);

// Create MySQLStore 
const sessionStore = new SQLStore({}, db);

//API routes
server.use("/api", apiRouter);

// // Global Error Handling
// server.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send("Something unusual occurred");
// });

// Run server
server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});
