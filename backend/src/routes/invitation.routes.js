import express from "express";

import { protect } from "../middleware/authMiddleware.js";
import { requireTenant } from "../middleware/tenant.middleware.js";
import { requireOrganizationRole } from "../utils/organizationAccess.js";

import {
    createInvitation,
    getInvitations,
    acceptInvitation,
    revokeInvitation
} from "../controllers/invitation.controller.js";

import { checkMemberLimit } from "../middleware/entitlement.middleware.js";

const router = express.Router();

router.use(protect);

// Invitation acceptance does not require existing membership.
router.post("/accept", acceptInvitation);

// Remaining endpoints require workspace authorization.
router.use(requireTenant);
router.use(requireOrganizationRole("owner", "admin"));

router.post("/", 
                checkMemberLimit,
                createInvitation
            );
router.get("/", getInvitations);
router.delete("/:id", revokeInvitation);

export default router;