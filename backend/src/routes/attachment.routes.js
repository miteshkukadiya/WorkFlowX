import express from "express";

import {
    uploadAttachment,
    getTaskAttachments,
    downloadAttachment,
    deleteAttachment
} from "../controllers/attachment.controller.js";

import {
    protect
} from "../middleware/authMiddleware.js";

import { requireTenant } from "../middleware/tenant.middleware.js";

import {
    uploadTaskAttachment
} from "../middleware/upload.middleware.js";


const router =
    express.Router();


router.use(protect);
router.use(requireTenant);


router.get(
    "/task/:taskId",
    getTaskAttachments
);


router.post(
    "/task/:taskId",
    uploadTaskAttachment,
    uploadAttachment
);


router.get(
    "/:attachmentId/download",
    downloadAttachment
);


router.delete(
    "/:attachmentId",
    deleteAttachment
);


export default router;