import mongoose from "mongoose";

import Project from "../models/Project.js";

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

            .populate("owner", "name email")
            .populate("members", "name email")
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