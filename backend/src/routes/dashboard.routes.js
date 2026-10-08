import express from "express";

import { getDashboard } from "../controllers/dashboard.controller.js";

import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();


router.use(protect);


router.get(
    "/",
    getDashboard
);


export default router;