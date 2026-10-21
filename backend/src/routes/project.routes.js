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
import { requireTenant } from "../middleware/tenant.middleware.js";
import { authorizePermission } from "../middleware/authorizePermission.js";
import { PERMISSIONS } from "../config/permissions.js";

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router
    .route("/")
    .post(
        authorizePermission(PERMISSIONS.PROJECT_CREATE),
        createProject
    )
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
    .delete(
        authorizePermission(PERMISSIONS.PROJECT_DELETE),
        deleteProject
    );



export default router;