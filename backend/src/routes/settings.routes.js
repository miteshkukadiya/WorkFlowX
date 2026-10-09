import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { avatarUpload } from "../middleware/avatarUpload.js";

import {
    getProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    updatePreferences
} from "../controllers/settings.controller.js";

const router = express.Router();

router.use(protect);

router.get("/profile", getProfile);

router.patch("/profile", updateProfile);

// router.post(
//     "/avatar",
//     avatarUpload.single("avatar"),
//     uploadAvatar
// );

router.post(
    "/avatar",

    (req, res, next) => {
        console.log("Avatar request Content-Type:", req.headers["content-type"]);
        next();
    },

    avatarUpload.single("avatar"),

    (req, res, next) => {
        console.log("Avatar req.file:", req.file);
        console.log("Avatar req.body:", req.body);
        next();
    },

    uploadAvatar
);

router.patch("/password", changePassword);

router.patch("/preferences", updatePreferences);

export default router;