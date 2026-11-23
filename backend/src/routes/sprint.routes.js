import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { getSprints, createSprint, updateSprint, assignTaskToSprint, removeTaskFromSprint } from "../controllers/sprint.controller.js";

const router = express.Router();
router.use(protect, requireTenant);
router.get("/", getSprints);
router.post("/", createSprint);
router.patch("/:id", updateSprint);
router.put("/:sprintId/tasks/:taskId", assignTaskToSprint);
router.delete("/:sprintId/tasks/:taskId", removeTaskFromSprint);
export default router;
