const bcrypt = require("bcrypt");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");


// register user
const registerUser = asyncHandler(async (req , res) => {

    const {name , email , password} = req.body;

    if(!name || !email || !password)
    {
        throw new ApiError(400 , "Name, email and password are required");
    }

    const existingUser = await User.findOne({
        email : email.toLowerCase()
    });

    if(existingUser)
    {
        throw new ApiError(
            400,
            "User with this email already exists"
        );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(
        password,
        10
    )

    // create user
    const user = await User.create({
        name , 
        email : email.toLowerCase(),
        password : hashedPassword
    });

    // this is remove password from response.
    const createdUser = {
        id : user._id,
        name : user.name,
        email : user.email,
        role : user.role,
        avatar : user.avatar,
        createdAt : user.createdAt
    }

    res.status(201).json(
        new ApiResponse(
            201,
            createdUser,
            "User registered successfully"
        )
    );


});


// login user
const loginUser = asyncHandler( async (req , res) => {

    const {email , password} = req.body;

    if(!email || !password)
    {
        throw new ApiError(400 , "Email and password are required");
    }

    const user = await User.findOne({
        email : email.toLowerCase()
    })
    .select("+password");

    if(!user)
    {
        throw new ApiError(
            401,
            "Invalid email or password"
        )
    }

    const isPasswordCorrect = await bcrypt.compare(
        password,
        user.password
    );

    if(!isPasswordCorrect)
    {
        throw new ApiError(
            401,
            "Invalid email or password"
        )
    }

    // generate jwt token
    const token = jwt.sign(
        {
            userId : user._id,
            role : user.role
        },

        process.env.JWT_SECRET,

        {
            expiresIn : process.env.JWT_EXPIRES_IN
        }
    )

    const loggedInUser = {
        id : user._id,
        name : user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
    }

    res.status(200).json(
        new ApiResponse(
            200,
            {
                user : loggedInUser,
                token : token
            },
            "User logged in successfully"
        )
    );

});


module.exports = {registerUser , loginUser};