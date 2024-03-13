import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import User from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

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

    // get user details from frontend
    const { fullName, email, username, password } = req.body; // generally, when we are passing the data in the form of JSON or form data -> we can access it through req.body
    console.log("email: ", email);



    // validation -> to check that data received is not empty
    if(
        [fullName, email, username, password].some((field) => 
        field.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }



    // check if user already exists: username, email
    const existedUser = await User.findOne({
        $or: [ { username }, { email } ]
    });

    if (existedUser) {
        throw new ApiError(409, "user with username or email already exists!");
    }



    // check for images, check for avatar,
    const avatarLocalPath = req.files?.avatar[0]?.path; // avatar[0] -> bracket notation of the Object
    // console.log(req.files);

    const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }



    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })


    
    // remove password and refresh token field from response
    // check for user creation
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    );

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user");
    }

    // return res
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User created successfully")
    );

});

export { registerUser };