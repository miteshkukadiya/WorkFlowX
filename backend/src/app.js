const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middleware/errorMiddleware");
const ApiError = require("./utils/ApiError");

const app = express();

app.use(cors());
app.use(express.json());


app.get("/api/health" , (req , res) => {

    res.status(200).json({
        success : true,
        message : "WorkFlowX API is running ",
        timestamp : new Date()
    });
});

app.get("/api/error" , (req , res , next) => {

    next(new ApiError(400 , "Testing error Handler"));


});

// error handler
app.use(errorMiddleware);

module.exports = app;