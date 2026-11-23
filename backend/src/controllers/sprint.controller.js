import mongoose from "mongoose";
import Sprint from "../models/Sprint.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";

const getProject = async (projectId, userId, organizationId) => {
    if (!mongoose.isValidObjectId(projectId)) return null;
    return Project.findOne({
        _id: projectId,
        organization: organizationId,
        $or: [{ owner: userId }, { members: userId }]
    });
};

export const getSprints = async (req, res) => {
    try {
        const project = await getProject(
            req.query.projectId,
            req.user._id,
            req.tenant.organizationId
        );
        if (!project) {
            return res.status(403).json({ success: false, message: "Project access denied" });
        }

        const sprints = await Sprint.find({ project: project._id }).sort({ status: 1, createdAt: -1 }).lean();
        const counts = await Task.aggregate([
            { $match: { project: project._id, sprint: { $ne: null } } },
            { $group: { _id: "$sprint", count: { $sum: 1 } } }
        ]);
        const countMap = new Map(counts.map(item => [String(item._id), item.count]));

        return res.json({
            success: true,
            data: sprints.map(sprint => ({ ...sprint, taskCount: countMap.get(String(sprint._id)) || 0 }))
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const createSprint = async (req, res) => {
    try {
        const { projectId, name, goal, startDate, endDate } = req.body;
        const project = await Project.findOne({
            _id: projectId,
            organization: req.tenant.organizationId,
            owner: req.user._id
        });
        if (!project) return res.status(403).json({ success: false, message: "Only the project owner can manage sprints" });
        if (!name?.trim()) return res.status(400).json({ success: false, message: "Sprint name is required" });
        if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
            return res.status(400).json({ success: false, message: "End date cannot be before start date" });
        }

        const sprint = await Sprint.create({
            project: project._id,
            name: name.trim(),
            goal: goal?.trim() || "",
            startDate: startDate || null,
            endDate: endDate || null
        });
        return res.status(201).json({ success: true, data: sprint });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const updateSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.id);
        if (!sprint) return res.status(404).json({ success: false, message: "Sprint not found" });
        const project = await Project.findOne({ _id: sprint.project, organization: req.tenant.organizationId, owner: req.user._id });
        if (!project) return res.status(403).json({ success: false, message: "Only the project owner can manage sprints" });

        const { status, name, goal, startDate, endDate } = req.body;
        if (status && !["planned", "active", "completed"].includes(status)) {
            return res.status(400).json({ success: false, message: "Invalid sprint status" });
        }
        if (status === "active") {
            await Sprint.updateMany({ project: sprint.project, status: "active", _id: { $ne: sprint._id } }, { $set: { status: "completed" } });
        }
        if (name !== undefined) sprint.name = name.trim();
        if (goal !== undefined) sprint.goal = goal.trim();
        if (status !== undefined) sprint.status = status;
        if (startDate !== undefined) sprint.startDate = startDate || null;
        if (endDate !== undefined) sprint.endDate = endDate || null;
        await sprint.save();
        return res.json({ success: true, data: sprint });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const assignTaskToSprint = async (req, res) => {
    try {
        const sprint = await Sprint.findById(req.params.sprintId);
        if (!sprint) return res.status(404).json({ success: false, message: "Sprint not found" });
        const project = await Project.findOne({ _id: sprint.project, organization: req.tenant.organizationId, $or: [{ owner: req.user._id }, { members: req.user._id }] });
        if (!project) return res.status(403).json({ success: false, message: "Project access denied" });
        const task = await Task.findOne({ _id: req.params.taskId, project: project._id });
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });
        task.sprint = sprint._id;
        await task.save();
        return res.json({ success: true, data: task });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

export const removeTaskFromSprint = async (req, res) => {
    try {
        const task = await Task.findById(req.params.taskId).populate("project", "organization owner members");
        if (!task || String(task.project.organization) !== String(req.tenant.organizationId)) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }
        const accessible = String(task.project.owner) === String(req.user._id) || task.project.members.some(id => String(id) === String(req.user._id));
        if (!accessible) return res.status(403).json({ success: false, message: "Project access denied" });
        task.sprint = null;
        await task.save();
        return res.json({ success: true, data: task });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};
