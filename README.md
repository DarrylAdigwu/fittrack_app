## ⚠️ Project Disclaimer & Scope
This application is a **non-commercial personal project** built strictly to showcase full-stack engineering skills.

- **Data Tracking:** This application does not track, collect, or analyze user behavior or data. All stored workout metrics are strictly for user-facing functionality.
- **Cookies & Privacy:** The application does not use tracking, advertising, or third-party cookies. It utilizes a single, essential functional cookie via `express-session` solely to maintain user authentication status while logged in.
- **Data Scope:** The system does not request, store, or process significant personal data, and features no integrations for importing external health datasets.
- **Intended Use:** It is intended solely as a portfolio demonstration.


# 🏋️‍♂️ Full-Stack Fitness Tracker

Full-stack web application built to log, track, and schedule workouts. This application features a custom calendar, custom validation middleware, and secure authentication.

## 🚀 Live Demo & Deployment
- **Live Application:** https://www.fittracker.us/
- **CI/CD Pipeline:** Automated via GitHub Actions & Render

## 🛠️ Architecture & Features
- **Frontend:** Built with **React** and **Vite** for optimized, fast UI rendering.
- **Custom Calendar:** Programmed completely from scratch using **Vanilla JavaScript** to handle dynamic workout scheduling and programmatic event rendering.
- **Backend & API:** Powered by **Node.js** and **Express.js** using custom REST endpoints to manage data communication.
- **Database:** Relational schema designed using **MySQL**, hosted on **AWS RDS**.
- **Security:** Custom input validation, secure session handling via `express-session`, and **Argon2** password hashing.
