import SavedView from "../models/SavedView.js";
import cacheService from "../../services/cache.service.js";
import invalidateSavedViewCache from "../utils/invalidateSavedViewCache.js";

export const getSavedViews = async (req, res) => {
    try {
        const cacheKey = `workflowx:saved-views:${req.user._id}`;
        const cachedViews = await cacheService.get(cacheKey);

        if (cachedViews) {
            return res.json(cachedViews);
        }

        const views = await SavedView.find({
            user: req.user._id
        }).sort({ createdAt: -1 });

        const responseData = {
            success: true,
            data: views
        };

        await cacheService.set(cacheKey, responseData, 300);

        return res.json(responseData);

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Unable to load saved views"
        });
    }
};

export const createSavedView = async (req, res) => {
    try {
        const { name, filters } = req.body;

        if (typeof name !== "string" || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "View name is required"
            });
        }

        const view = await SavedView.create({
            user: req.user._id,
            name: name.trim(),
            filters: filters || {}
        });

        await invalidateSavedViewCache(req.user._id);

        return res.status(201).json({
            success: true,
            data: view
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "A view with this name already exists"
            });
        }

        return res.status(500).json({
            success: false,
            message: "Unable to save view"
        });
    }
};

export const deleteSavedView = async (req, res) => {
    try {
        const view = await SavedView.findOneAndDelete({
            _id: req.params.id,
            user: req.user._id
        });

        if (!view) {
            return res.status(404).json({
                success: false,
                message: "Saved view not found"
            });
        }

        await invalidateSavedViewCache(req.user._id);

        return res.json({
            success: true,
            message: "Saved view deleted"
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Invalid saved view request"
        });
    }
};