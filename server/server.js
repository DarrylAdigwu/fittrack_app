import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import apiRouter from "./routes/api.js";
import { db } from "./database/db.js";

// Create Web App
const server = express();

// Configure .env files
dotenv.config();

// Middleware for web security
server.use(helmet());

// Middleware for parsing cookies
server.use(cookieParser());

// Middleware for proxy server
server.set("trust proxy", 1);

// Middleware for cross-origin resources and pass header
export const domain = process.env.NODE_ENV === "production" ? `${process.env.NGINX_DOMAIN}` : `${process.env.REACT_DEV_DOMAIN}`;
server.use(cors({
  origin: "https://www.darryladigwu.com/", 
  credentials: true,
}));

// Configure middleware for JSON, public folder, and parsing body
server.use(express.static("public"));
server.use(express.json());
server.use(express.urlencoded({extended:true}));

//Create SQL connection pool
const SQLStore = MySQLStore(session);

// Create MySQLStore 
const sessionStore = new SQLStore({}, db);

// Create Session
server.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 1000 * 60 * 60,
    domain: "darryladigwu.com",
  },
}));

// API routes
server.use("/api", apiRouter);

// Run server
server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});