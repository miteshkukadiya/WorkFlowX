import express from "express";

import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks
} from "../controllers/task.controller.js";

import { protect } from "../middleware/authMiddleware.js";

import { validate } from "../middleware/validate.js";
import { createTaskSchema } from "../../validators/task.validator.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { requireProjectAccess } from "../middleware/projectAccess.middleware.js";

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router
    .route("/")
    // .post(createTask)
    .post(
        validate(createTaskSchema),
        requireProjectAccess(req => req.body.projectId),
        createTask
    )
    .get(getTasks);

router.patch(
    "/reorder",
    reorderTasks
);

router.patch(
    "/:id/move",
    moveTask
);

router
    .route("/:id")
    .get(getTaskById)
    .patch(updateTask)
    .delete(deleteTask);

export default router;