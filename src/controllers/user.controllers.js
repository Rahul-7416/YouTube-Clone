import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false }); // validateBeforeSave -> if we don't make it false then it will first validate that all other parameters are passed or not -> like password, etc.

        return { accessToken, refreshToken };

    } catch (err) {
        throw new ApiError(500, "Something went wrong while generating refresh token and access token");
    }
}

// registerUser
const registerUser = asyncHandler(async (req, res) => {
    // STEPS -> 
    // get user details from frontend
    // validation -> not empty // generally we have a separate folder for these validations too
    // check if user already exists: username, email
    // check for images, check for avatar,
    // upload them to clodinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return response

    // Step1: get user details from frontend
    // console.log(req.body); // Testing purpose
    const { fullName, email, username, password } = req.body; // generally, when we are passing the data in the form of JSON or form data -> we can access it through req.body
    // console.log("email: ", email); // Testing purpose



    // Step2: validation -> to check that data received is not empty
    if(
        [fullName, email, username, password].some((field) => 
        field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }



    // Step3: check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [ { username }, { email } ]
    });

    if (existedUser) {
        throw new ApiError(409, "user with username or email already exists!");
    }



    // Step4: check for images, check for avatar,
    const avatarLocalPath = req.files?.avatar[0]?.path; // avatar[0] -> bracket notation of the Object
    // console.log(req.files); // Testing purpose

    // const coverImageLocalPath = req.files?.coverImage[0]?.path; // this will give TypeError: Cannot read properties of undefined -> whenever we are using an optional chaining -> ?. -> always verify whether the data is received or not before proceeding any further

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path; // no need to implement partial check here -> as we have already checked everything in the if condition
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    // console.log(avatar); // Testing purpose
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }



    // Step5: create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })


    
    // Step6: remove password and refresh token field from response
    // Step7: check for user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // Step8: return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    );

});

const loginUser = asyncHandler(async (req, res) => {

    // STEPS or FLOWCHART
    // req.body -> data
    // username or email
    // find the user based on username or email
    // password check 
    // generate access and refresh token 
    // send cookies -> send both the tokens in the form of cookies

    // Step1: req.body -> data 
    const {username, email, password} = req.body;
    // console.log(email) // Testing purpose

    // Step2: username or email -> non-empty validation
    // (!(username || email)) -> this can also be used here -> when we oly need one of them
    if (!username && !email) {
        throw new ApiError(400, "username or email is required");
    }

    // Step3: find the user based on the username or email
    const user = await User.findOne({
        $or: [ {username}, {email} ]
    });

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    // Step4: password check
    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!password) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // Step5: generate access and refresh token 
    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    // Optional Step: we are doing this to avoid sending password and refreshToken fields to the user.
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken"); 

    // Step6: send cookies
    const options = {
        // we are setting these two as false -> so that the cookies can only be modified from the server and not from the user's browser 
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options) // cookie("key", value, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            // Why we have again passed the tokens here -> we have done so, so that if user needs those value in the mobile app development, he/she can get it from here
            {
                user: loggedInUser,
                accessToken,
                refreshToken,
            },
            "User logged in successfully",
        )
    )

});

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            // $set -> a mongoDB operator
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true, // as we want the new updated value of refreshToken
        }
    )

    const options = { 
        httpOnly: true,
        secure: true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => { // NOTE: This is not the state after the logout
    try {
        const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
        if (!incomingRefreshToken) {
            throw new ApiError(401, "Unauthorized request")
        }
        console.log(incomingRefreshToken);
    
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET,
        )
        console.log(decodedToken?._id);
    
        const user = await User.findById(decodedToken?._id);
    
        if (!user) {
            throw new ApiError(401, "Invalid refresh token");
        }
    
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used");
        }
        console.log(user?._id);
    
        const options = {
            httpOnly: true,
            secure: true,
        }
    
        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
        console.log("newRefreshToken : ", newRefreshToken);
    
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(
                200,
                { accessToken, refreshToken: newRefreshToken },
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }

})


export { registerUser, loginUser, logoutUser, refreshAccessToken };