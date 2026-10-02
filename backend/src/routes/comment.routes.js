import express from "express";

import {
    addComment,
    getComments,
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js";

import {
    protect
} from "../middleware/authMiddleware.js";


const router =
    express.Router();


router.use(protect);


router
    .route("/task/:taskId")
    .get(getComments)
    .post(addComment);


router
    .route("/:commentId")
    .patch(updateComment)
    .delete(deleteComment);


export default router;