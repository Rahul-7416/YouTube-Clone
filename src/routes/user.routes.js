import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAccessToken } from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// --> router.get("/register", registerUser) --> router.get("/register", async function registerUser(req, res, next) => {/* Operation */})
// but we can't use .get or .any_method as we are not importing the whole express lib here, we are just importing the Router part of it
// so we have to follow the below syntax
router.route("/register").post(
    // middleware
    upload.fields([
        {
            name: "avatar",
            maxCount: 1,
        },
        {
            name: "coverImage",
            maxCount: 1,
        },
    ]),
    registerUser,
); 

router.route("/login").post(loginUser);

// Secured Routes -> user is already logged in
router.route("/logout").post(verifyJWT, logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

export default router;
