const jwt = require("jsonwebtoken");

const User = require("../models/User");

const asyncHandler = require("../utils/asyncHandler");

const ApiError = require("../utils/ApiError");

const protect = asyncHandler(async (req , res , next) => {

    // this is authorization header

    const authHeader = req.headers.authorization;

    if(!authHeader)
    {
        throw new ApiError(
            401,
            "Authentication required"
        );
    }

    // check bearer token

    if(!authHeader.startsWith("Bearer "))
    {
        throw new ApiError(
            401,
            "Invalid authorization format"
        );
    }

    // extract token

    const token = authHeader.split(" ")[1];

    if (!token) {

        throw new ApiError(
            401,
            "Authentication token is missing"
        );

    }

    
    let decoded;

    try {
        
        decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    } catch (error) {
     
        if (error.name === "TokenExpiredError") {

        throw new ApiError(
            401,
            "Authentication token has expired"
        );

        }


        throw new ApiError(
            401,
            "Invalid authentication token"
        );

    }

    // find user
    const user = await User.findById(decoded.userId);

    if(!user)
    {
        throw new ApiError(
            401,
            "User associated with this token no longer exists"
        );
    }

    req.user = user;

    next();

});


const authorize = (...roles) => {
    return (req , res , next) => {
        if (!req.user) {

            return next(
                new ApiError(
                    401,
                    "Authentication required"
                )
            );

        }

        if(!roles.includes(req.user.role))
        {
            return next(
                new ApiError(
                    403,
                    "You are not authorized to perform this action"
                )
            );
        }

        next();
    }
}

module.exports = { protect , authorize};