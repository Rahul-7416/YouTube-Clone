import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; 

const app = express();


// NOTE: We use middlewares as app.use(middleware)
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

// Configuring url data
// When we are sending the form data req
app.use(express.json({limit: "16kb"}));

// configuring url data
// We used the extended to pass nested objects in the url
app.use(express.urlencoded({extended: true, limit: "16kb"}));

// configuring static data -> like: videos, images, etc
app.use(express.static("public"));

// NOTE: We use cookie-parser to apply CRUD operations on the cookies stored in the user's browser 
// -> only server have access to these cookies 
app.use(cookieParser());

// routes import 
import userRouter from "./routes/user.routes.js"; // -> we can import something by giving custom name only when we are exporting that file using default keyword -> like importing with name "userRouter" is possible only because -> we have exported this file using "export default router"


// routes declaration
app.use("/api/v1/users", userRouter); // -> http://localhost:8000/api/v1/users/register



export { app };