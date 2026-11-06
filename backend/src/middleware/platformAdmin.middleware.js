import PlatformAdmin from "../models/PlatformAdmin.js";
import ApiError from "../utils/ApiError.js";

export const requirePlatformAdmin = async (
    req,
    res,
    next
) => {
    try {
        if (!req.user) {
            throw new ApiError(
                401,
                "Authentication required"
            );
        }

        const platformAdmin = await PlatformAdmin.findOne({
            user: req.user._id,
            status: "active"
        });

        if (!platformAdmin) {
            throw new ApiError(
                403,
                "Platform administrator access required"
            );
        }

        req.platformAdmin = platformAdmin;

        next();
    } catch (error) {
        next(error);
    }
};