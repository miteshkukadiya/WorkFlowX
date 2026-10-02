import multer from "multer";

import path from "path";

import fs from "fs";


const uploadDirectory =
    path.join(
        process.cwd(),
        "uploads",
        "tasks"
    );


if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


const storage =
    multer.diskStorage({

        destination: (
            req,
            file,
            callback
        ) => {

            callback(
                null,
                uploadDirectory
            );

        },


        filename: (
            req,
            file,
            callback
        ) => {

            const extension =
                path.extname(
                    file.originalname
                );


            const baseName =
                path
                    .basename(
                        file.originalname,
                        extension
                    )
                    .replace(
                        /[^a-zA-Z0-9-_]/g,
                        "-"
                    )
                    .slice(0, 60);


            const uniqueName =
                `${Date.now()}-${Math.round(
                    Math.random() *
                    1e9
                )}-${baseName}${extension}`;


            callback(
                null,
                uniqueName
            );

        }

    });

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

        storage,

        fileFilter,

        limits: {

            fileSize:
                10 * 1024 * 1024

        }

    }).single(
        "file"
    );