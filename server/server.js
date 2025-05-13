import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import session from "express-session";
import MySQLStore from "express-mysql-session";
import apiRouter from "./routes/api.js"

// Create Web App
const server = express();

// Configure .env
dotenv.config();

// Middleware for web security
server.use(helmet());

// Middleware for cross-origin
server.use(cors({
  origin: `http://localhost`,
  credentials: true,
}));


//API routes
server.use("/api", apiRouter)

// Global Error Handling
server.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something unusual occurred");
});

// Run server
server.listen(process.env.PORT, () => {
  console.log(`Server listening on port ${process.env.PORT}`);
});

// Close server
process.on('SIGINT', () => {
  console.info('SIGINT signal received.');
  console.log('Closing http server.');
  listen.close(() => {
    console.log('Http server closed.');
    process.exit(0);
  });
});