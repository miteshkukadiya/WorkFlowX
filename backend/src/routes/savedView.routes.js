import express from "express";

import { protect } from "../middleware/authMiddleware.js";

import {
    getSavedViews,
    createSavedView,
    deleteSavedView
} from "../controllers/savedView.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getSavedViews);
router.post("/", createSavedView);
router.delete("/:id", deleteSavedView);

export default router;