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

const router = express.Router();

router.use(protect);

router
    .route("/")
    .post(createTask)
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