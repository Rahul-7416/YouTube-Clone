// require("dotenv").config({path: "./env"}); // it will work fine, but as it down our code consistency, we will not choose this import method

import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path: "./env"
})


connectDB()
.then(() => { 
    app.on("error", (err) => { // DOUBT -> app.on -> it is not throwing any error, but it's also not logging the messages on the console
        console.error("Error: ", err);
        throw err;
    })
})
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️  Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.error("MongoDB connection FAILED!!! ", err);
})


















/*
// Approach 1

import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";

import express from "express";
const app = express();

// Use iffe -> so that the function will be executed imediately
// Use async await -> server is in another continent -> so process might take time to complete
// Use try catch block -> as errors can come while connecting to the database
( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        app.on("error", (error) => {
            console.error("Error: ", error);
            throw error;
        });

        app.listen(process.env.PORT, () => {
            console.log(`App is listening on port ${process.env.PORT}`);
        })
    }
    catch (error) {
        console.error("ERROR: ", error);
        throw error;
    }
})()

*/