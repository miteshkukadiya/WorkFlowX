import multer from "multer";
import mongoose from "mongoose";

export const notFound = (req, res, next) => {
    const error = new Error(
        `Route not found: ${req.method} ${req.originalUrl}`
    );

    error.statusCode = 404;
    next(error);
};

export const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || error.status || 500;
    let message = error.message || "Internal server error";

    if (error instanceof mongoose.Error.ValidationError) {
        statusCode = 400;
        message = "Invalid request data";
    }

    if (error instanceof mongoose.Error.CastError) {
        statusCode = 400;
        message = "Invalid resource ID";
    }

    if (error?.code === 11000) {
        statusCode = 409;
        message = "Duplicate record";
    }

    if (error instanceof multer.MulterError) {
        statusCode = 400;

        message = error.code === "LIMIT_FILE_SIZE"
            ? "Uploaded file exceeds the allowed size"
            : "Invalid file upload";
    }

    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        statusCode = 400;
        message = "Invalid JSON request body";
    }

    if (statusCode >= 500) {
        console.error(error);
        message = "Internal server error";
    }

    return res.status(statusCode).json({
        success: false,
        message
    });
};