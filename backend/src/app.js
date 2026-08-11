const express = require("express");
const cors = require("cors");
const errorMiddleware = require("./middleware/errorMiddleware");
const ApiError = require("./utils/ApiError");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/auth" , authRoutes);


// error handler
app.use(errorMiddleware);

module.exports = app;