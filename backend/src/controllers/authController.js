const bcrypt = require("bcrypt");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const { sendEmail } = await import("../services/email.service.js");
    await sendEmail({
        to: email,
        subject: "Reset your WorkFlowX password",
        text: `Reset your password using this link: ${resetUrl}. This link expires in 15 minutes.`,
        html: `<p>Reset your WorkFlowX password:</p><p><a href="${resetUrl}">Reset password</a></p><p>This link expires in 15 minutes.</p>`
    });
};


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
        avatar: user.avatar,
        preferences: {
            theme: user.preferences?.theme || "system",
            timezone: user.preferences?.timezone || "Asia/Kolkata",
            notifications: {
                taskAssigned: user.preferences?.notifications?.taskAssigned ?? true,
                taskStatusChanged: user.preferences?.notifications?.taskStatusChanged ?? true,
                comments: user.preferences?.notifications?.comments ?? true,
                projectInvites: user.preferences?.notifications?.projectInvites ?? true
            }
        }
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

const getCurrentUser = asyncHandler(async (req , res) => {

    const user = req.user;

    const userData = {

        id: user._id,

        name: user.name,

        email: user.email,

        role: user.role,

        avatar: user.avatar,

        preferences: {
            theme: user.preferences?.theme || "system",
            timezone: user.preferences?.timezone || "Asia/Kolkata",
            notifications: {
                taskAssigned: user.preferences?.notifications?.taskAssigned ?? true,
                taskStatusChanged: user.preferences?.notifications?.taskStatusChanged ?? true,
                comments: user.preferences?.notifications?.comments ?? true,
                projectInvites: user.preferences?.notifications?.projectInvites ?? true
            }
        },

        createdAt: user.createdAt

    };


    res.status(200).json(
        new ApiResponse(
            200,
            userData,
            "Current user fetched successfully"
        )
    );

})

const forgotPassword = asyncHandler(async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const genericMessage = "If an account exists for this email, a reset link has been sent.";
    const user = await User.findOne({ email }).select("+passwordResetToken +passwordResetExpires");

    if (user) {
        const token = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto.createHash("sha256").update(token).digest("hex");
        user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
        await user.save({ validateBeforeSave: false });
        await sendPasswordResetEmail(user.email, token);
    }

    res.status(200).json(new ApiResponse(200, null, genericMessage));
});

const resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;
    if (typeof token !== "string" || typeof password !== "string" || password.length < 6) {
        throw new ApiError(400, "A valid token and password of at least 6 characters are required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() }
    }).select("+password +passwordResetToken +passwordResetExpires");

    if (!user) {
        throw new ApiError(400, "Reset token is invalid or expired");
    }

    user.password = await bcrypt.hash(password, 10);
    user.passwordChangedAt = new Date();
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    res.status(200).json(new ApiResponse(200, null, "Password reset successfully"));
});

module.exports = {registerUser , loginUser , getCurrentUser, forgotPassword, resetPassword};