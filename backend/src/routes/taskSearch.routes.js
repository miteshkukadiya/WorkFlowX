import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { searchTasks } from "../controllers/taskSearch.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", searchTasks);

export default router;