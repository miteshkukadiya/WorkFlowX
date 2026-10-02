import multer from "multer";


const errorMiddleware = (err , req , res , next) => {

    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        success : false,
        message : err.message || "Internal server error",
    });


    if (
        err instanceof
        multer.MulterError
    ) {

        if (
            err.code ===
            "LIMIT_FILE_SIZE"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "File cannot exceed 10 MB"
            });

        }


        return res.status(400).json({
            success: false,
            message:
                err.message
        });

    }

    if (
        err.message ===
        "Unsupported file type"
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Unsupported file type"
        });

    }

};

// module.exports = errorMiddleware;
export default errorMiddleware;