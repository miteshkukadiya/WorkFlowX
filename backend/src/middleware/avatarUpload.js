import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const uploadDirectory = path.resolve(
    "uploads",
    "avatars"
);

fs.mkdirSync(uploadDirectory, {
    recursive: true
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    filename: (req, file, cb) => {
        const extension = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp"
        }[file.mimetype];

        cb(
            null,
            `${crypto.randomUUID()}${extension || ""}`
        );
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/webp"
    ];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(
            new Error("Only JPG, PNG and WEBP images are allowed")
        );
    }

    cb(null, true);
};

export const avatarUpload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});