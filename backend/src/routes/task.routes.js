import express from "express";

import {
    createTask,
    getTasks,
    getTaskById,
    updateTask,
    deleteTask
} from "../controllers/task.controller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
    .route("/")
    .post(createTask)
    .get(getTasks);

router
    .route("/:id")
    .get(getTaskById)
    .patch(updateTask)
    .delete(deleteTask);

export default router;