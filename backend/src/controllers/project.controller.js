import mongoose from "mongoose";

import Project from "../models/Project.js";
import User from "../models/User.js";
import Task from "../models/Task.js";
import createNotification from "../utils/createNotification.js";

export const createProject = async (req , res) => {

    try{

        const { name,  description, status,  priority, startDate,  endDate,  color } = req.body;

        if(!name || !name.trim())
        {
            return res.status(400).json({message: "Project name is required"});
        }

        if(startDate && endDate && new Date(endDate) < new Date(startDate))
        {
            return res.status(400).json({message: "End date cannot be before start date"});
        }

        const project = await Project.create({
            name,
            description,
            status,
            priority,
            startDate,
            endDate,
            color,
            owner: req.user._id,
            members: []
        })

        return res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        })
    }catch(error)
    {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }

};

export const getProjects = async (req , res) => {
    try {

        const projects = await Project.find({
            $or :[
                { owner: req.user._id },
                { members: req.user._id }
            ]
        })

            .populate("owner", "name email role")
            .populate("members", "name email role")
            .sort({ createdAt: -1 });

            return res.status(200).json({
                success: true,
                count: projects.length,
                data: projects
            })

        
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getProjectById = async (req , res) => {

    try {
        
        const {id} = req.params;

         if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        const project = await Project.findOne({
            _id: id,
            $or: [
                { owner: req.user._id },
                { members: req.user._id }
            ]
        })

        .populate("owner", "name email")
        .populate("members", "name email");

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: project
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }

};


export const updateProject = async(req,res) => {

    try {

        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        const project = await Project.findOne({
            _id: id,
            owner: req.user._id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found or access denied"
            });
        }

         const allowedFields = [
            "name",
            "description",
            "status",
            "priority",
            "startDate",
            "endDate",
            "color"
        ];

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                project[field] = req.body[field];
            }
        }

        if (!project.name?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Project name is required"
            });
        }

        if (
            project.endDate &&
            project.startDate &&
            project.endDate < project.startDate
        ) {
            return res.status(400).json({
                success: false,
                message: "End date cannot be before start date"
            });
        }

        await project.save();

        return res.status(200).json({
            success: true,
            message: "Project updated successfully",
            data: project
        });
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }

};

export const deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid project ID"
            });
        }

        const project = await Project.findOneAndDelete({
            _id: id,
            owner: req.user._id
        });

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found or access denied"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Project deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export const addProjectMember = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;

        const {
            userId
        } = req.body;


        // VALIDATE PROJECT

        if (
            !mongoose.isValidObjectId(id)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid project ID"
            });

        }


        // VALIDATE USER

        if (
            !mongoose.isValidObjectId(
                userId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid user ID"
            });

        }


        const project =
            await Project.findById(id);


        if (!project) {

            return res.status(404).json({
                success: false,
                message:
                    "Project not found"
            });

        }


        // ONLY OWNER CAN ADD MEMBER

        if (
            String(project.owner) !==
            String(req.user._id)
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Only project owner can add members"
            });

        }


        // CANNOT ADD OWNER

        if (
            String(project.owner) ===
            String(userId)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Project owner is already part of the project"
            });

        }


        const user =
            await User.findById(
                userId
            ).select(
                "_id name email role"
            );


        if (!user) {

            return res.status(404).json({
                success: false,
                message:
                    "User not found"
            });

        }


        const alreadyMember =
            project.members.some(
                (member) =>
                    String(member) ===
                    String(userId)
            );


        if (alreadyMember) {

            return res.status(400).json({
                success: false,
                message:
                    "User is already a project member"
            });

        }


        project.members.push(
            userId
        );


        await project.save();

        await createNotification({

            recipient:
                userId,

            sender:
                req.user._id,

            type:
                "project_member_added",

            title:
                "Added to project",

            message:
                `You were added to ${project.name}`,

            project:
                project._id

        });


        const updatedProject =
            await Project.findById(id)

                .populate(
                    "owner",
                    "name email role"
                )

                .populate(
                    "members",
                    "name email role"
                );


        return res.status(200).json({

            success: true,

            message:
                "Member added successfully",

            data: updatedProject

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


export const getProjectMembers = async (
    req,
    res
) => {

    try {

        const {
            id
        } = req.params;


        if (
            !mongoose.isValidObjectId(id)
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid project ID"
            });

        }


        const project =
            await Project.findById(id)

                .populate(
                    "owner",
                    "name email role"
                )

                .populate(
                    "members",
                    "name email role"
                );


        if (!project) {

            return res.status(404).json({
                success: false,
                message:
                    "Project not found"
            });

        }


        const isOwner =
            String(project.owner._id) ===
            String(req.user._id);


        const isMember =
            project.members.some(
                (member) =>
                    String(member._id) ===
                    String(req.user._id)
            );


        if (!isOwner && !isMember) {

            return res.status(403).json({
                success: false,
                message:
                    "Project access denied"
            });

        }


        return res.status(200).json({

            success: true,

            data: {

                owner:
                    project.owner,

                members:
                    project.members

            }

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


export const removeProjectMember = async (
    req,
    res
) => {

    try {

        const {
            id,
            userId
        } = req.params;


        if (
            !mongoose.isValidObjectId(id) ||
            !mongoose.isValidObjectId(
                userId
            )
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "Invalid project or user ID"
            });

        }


        const project =
            await Project.findById(id);


        if (!project) {

            return res.status(404).json({
                success: false,
                message:
                    "Project not found"
            });

        }


        if (
            String(project.owner) !==
            String(req.user._id)
        ) {

            return res.status(403).json({
                success: false,
                message:
                    "Only project owner can remove members"
            });

        }


        const memberExists =
            project.members.some(
                (member) =>
                    String(member) ===
                    String(userId)
            );


        if (!memberExists) {

            return res.status(404).json({
                success: false,
                message:
                    "Project member not found"
            });

        }


        project.members =
            project.members.filter(
                (member) =>
                    String(member) !==
                    String(userId)
            );


        await project.save();


        /*
         * Remove assignment from tasks
         * assigned to this member.
         *
         * IMPORTANT:
         * Task must already be imported.
         */

        await Task.updateMany(
            {
                project: project._id,
                assignedTo: userId
            },
            {
                $set: {
                    assignedTo: null
                }
            }
        );


        const updatedProject =
            await Project.findById(id)

                .populate(
                    "owner",
                    "name email role"
                )

                .populate(
                    "members",
                    "name email role"
                );


        return res.status(200).json({

            success: true,

            message:
                "Member removed successfully",

            data: updatedProject

        });


    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

