import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, // to remove the whitespaces from both the sides of the String -> to save Strings like " hello" , or "hello " , or " hello " , would end up being saved as "hello" in Mongo 
            index: true // if you want to make any field searchable in MongoDB in a very optimized way -> use index -> offcourse it increases the computational cost, but not that much
        },
        email : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // cloudinary url -> which will serve as a folder where we have all our images stored
            required: true,
        },
        coverImage: {
            type: String, // cloudnary url
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, "Password is required"],
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true
    }
)

// do not use arrow function as the second argument
// -> as we can't use this keyword inside an arrow function -> as arrow function don't have the context of this keyword
// Also, use async keyword as the process might take time
// next -> signifies that this middleware function is executed -> now call the next function in the stack
userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next(); // ensures that the password will be changed only if password is changed, and not on other field's value being changed

    // hashing the password
    this.password = bcrypt.hash(this.password, 10); // (the password to be hassed, salt{no of rounds})
    next();
})

// making custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password); // returns a Boolean value 
}

userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        // payload
        {
            _id: this._id,
            email: this.email,
            username: this.email,
            fullName: this.fullName
        },
        // secretOrPrivateKey
        process.env.ACCESS_TOKEN_SECRET,
        // options -> like expiresIn, etc
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        },
    )
}


userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        // payload
        {
            _id: this._id,
            email: this.email,
            username: this.email,
            fullName: this.fullName
        },
        // secretOrPrivateKey
        process.env.REFRESH_TOKEN_SECRET,
        // options -> like expiresIn, etc
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        },
    )
}

export const User = mongoose.model("User", userSchema);