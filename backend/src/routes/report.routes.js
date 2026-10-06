import express from "express";

import { getDashboardReport } from "../controllers/report.controller.js";

import { protect } from "../middleware/authMiddleware.js";


const router = express.Router();


router.use(protect);


router.get(
    "/dashboard",
    getDashboardReport
);


export default router;