import express from "express";

import {
    addComment,
    addReply,
    getComments,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";

import {
    protect
} from "../middleware/authMiddleware.js";

import { requireTenant } from "../middleware/tenant.middleware.js";

const router =
    express.Router();


router.use(protect);
router.use(requireTenant);


router
    .route("/task/:taskId")
    .get(getComments)
    .post(addComment);


router
    .route("/:commentId")
    .patch(updateComment)
    .delete(deleteComment);

router.post(
    "/:commentId/replies",
    addReply
);


export default router;