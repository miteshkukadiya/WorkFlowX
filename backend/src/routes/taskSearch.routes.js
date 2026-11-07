import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { searchTasks } from "../controllers/taskSearch.controller.js";

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router.get("/", searchTasks);

export default router;