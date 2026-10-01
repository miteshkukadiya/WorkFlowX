import express from "express";

import {
    startTimer,
    stopTimer,
    getActiveTimer,
    createManualEntry,
    getTimeEntries,
    getTimeSummary
} from "../controllers/timeEntry.controller.js";

import {protect} from "../middleware/authMiddleware.js";


const router =
    express.Router();


router.use(protect);


router.post(
    "/start",
    startTimer
);


router.patch(
    "/stop",
    stopTimer
);


router.get(
    "/active",
    getActiveTimer
);


router.post(
    "/manual",
    createManualEntry
);


router.get(
    "/entries",
    getTimeEntries
);


router.get(
    "/summary",
    getTimeSummary
);


export default router;