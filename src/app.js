import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser"; // NOTE: We use cookie-parser to apply CRUD operations on the cookies stored in the user's browser -> only server have access to these cookies 

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

export { app };