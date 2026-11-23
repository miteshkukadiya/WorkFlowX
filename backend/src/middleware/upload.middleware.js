import multer from "multer";

const allowedMimeTypes =
    new Set([

        "image/jpeg",
        "image/png",
        "image/webp",

        "application/pdf",

        "text/plain",

        "application/msword",

        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "application/vnd.ms-excel",

        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

    ]);

const fileFilter = (
    req,
    file,
    callback
) => {

    if (
        allowedMimeTypes.has(
            file.mimetype
        )
    ) {

        return callback(
            null,
            true
        );

    }


    callback(
        new Error(
            "Unsupported file type"
        )
    );

};


export const uploadTaskAttachment =
    multer({

        storage: multer.memoryStorage(),

        fileFilter,

        limits: {

            fileSize:
                10 * 1024 * 1024

        }

    }).single(
        "file"
    );