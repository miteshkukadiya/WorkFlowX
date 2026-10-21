import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { authorizePermission } from "../middleware/authorizePermission.js";
import { PERMISSIONS } from "../config/permissions.js";
import { getAuditLogs } from "../controllers/audit.controller.js";

const router = express.Router();

router.use(protect);
router.use(requireTenant);

router.get(
    "/",
    authorizePermission(PERMISSIONS.AUDIT_VIEW),
    getAuditLogs
);

export default router;