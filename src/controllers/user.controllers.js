import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
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

export { registerUser };