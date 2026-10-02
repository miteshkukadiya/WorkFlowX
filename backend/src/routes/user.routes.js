import express from "express";

import {
    searchUsers
} from "../controllers/user.controller.js";

import {
    protect
} from "../middleware/authMiddleware.js";


const router =
    express.Router();


router.use(protect);


router.get(
    "/search",
    searchUsers
);


export default router;