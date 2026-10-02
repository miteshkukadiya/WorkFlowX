import express from "express";

import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    getProjectMembers,
    removeProjectMember
} from "../controllers/project.controller.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router
    .route("/")
    .post(createProject)
    .get(getProjects);

router.get(
    "/:id/members",
    getProjectMembers
);


router.post(
    "/:id/members",
    addProjectMember
);


router.delete(
    "/:id/members/:userId",
    removeProjectMember
);

router
    .route("/:id")
    .get(getProjectById)
    .patch(updateProject)
    .delete(deleteProject);

export default router;