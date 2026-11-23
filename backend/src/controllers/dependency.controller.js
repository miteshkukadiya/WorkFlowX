import mongoose from "mongoose";
import Task from "../models/Task.js";
import Project from "../models/Project.js";

const hasProjectAccess = (project, userId) =>
    String(project.owner) === String(userId) ||
    project.members.some(member => String(member) === String(userId));

const isReachable = async (startId, targetId, visited = new Set()) => {
    const key = String(startId);
    if (key === String(targetId)) return true;
    if (visited.has(key)) return false;
    visited.add(key);

    const task = await Task.findById(startId).select("dependencies").lean();
    for (const dependencyId of task?.dependencies || []) {
        if (await isReachable(dependencyId, targetId, visited)) return true;
    }

    return false;
};

export const getDependencies = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({ success: false, message: "Invalid task ID" });
        }

        const task = await Task.findById(req.params.id)
            .populate("dependencies", "title status dueDate assignedTo")
            .populate("assignedTo", "name email");

        if (!task) return res.status(404).json({ success: false, message: "Task not found" });

        const project = await Project.findOne({
            _id: task.project,
            organization: req.tenant.organizationId
        }).select("owner members");
        if (!project || !hasProjectAccess(project, req.user._id)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        return res.status(200).json({ success: true, data: task.dependencies || [] });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateDependencies = async (req, res) => {
    try {
        const { id } = req.params;
        const dependencyIds = Array.isArray(req.body.dependencyIds)
            ? [...new Set(req.body.dependencyIds.map(String))]
            : null;

        if (!mongoose.isValidObjectId(id) || !dependencyIds) {
            return res.status(400).json({ success: false, message: "A valid dependencyIds array is required" });
        }
        if (dependencyIds.some(dependencyId => !mongoose.isValidObjectId(dependencyId))) {
            return res.status(400).json({ success: false, message: "One or more dependency IDs are invalid" });
        }
        if (dependencyIds.includes(String(id))) {
            return res.status(400).json({ success: false, message: "A task cannot depend on itself" });
        }

        const task = await Task.findById(id);
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });

        const project = await Project.findOne({
            _id: task.project,
            organization: req.tenant.organizationId
        }).select("owner members");
        if (!project || !hasProjectAccess(project, req.user._id)) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }

        const dependencies = await Task.find({
            _id: { $in: dependencyIds },
            project: task.project
        }).select("_id");

        if (dependencies.length !== dependencyIds.length) {
            return res.status(400).json({ success: false, message: "Dependencies must belong to the same project" });
        }

        for (const dependencyId of dependencyIds) {
            if (await isReachable(dependencyId, id)) {
                return res.status(400).json({ success: false, message: "This dependency would create a cycle" });
            }
        }

        task.dependencies = dependencyIds;
        await task.save();
        await task.populate("dependencies", "title status dueDate assignedTo");

        return res.status(200).json({ success: true, data: task.dependencies });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
