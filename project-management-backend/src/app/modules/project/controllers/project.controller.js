const { ProjectModel } = require("../models/project.model");
const { msg } = require("../../../../config/message");
const { isValid } = require("../../../middleware/validator.middleware");
const { TaskModel } = require("../../task/models/task.model");

const mongoose = require("mongoose");

const ProjectController = {
    // Get All Project
    getAllProject: async (req, res) => {
        try {
            let { page = 1, limit = 9 } = req.query
            page = parseInt(page);
            limit = parseInt(limit);
            const userId = new mongoose.Types.ObjectId(req.user._id)
            let filter = { isDeleted: false, users: { $in: [userId] } }
            if (isValid(req.query.key)) {
                filter.$or = [
                    { title: { $regex: req.query.key, $options: "i" } },
                    { description: { $regex: req.query.key, $options: "i" } },
                ];
            }
            if (isValid(req.query.status)) {
                filter.status = req.query.status
            }

            let aggregateQuery = [
                { $match: filter },
                {
                    $lookup: {
                        from: "users",
                        localField: "owner",
                        foreignField: "_id",
                        pipeline: [{ $project: { name: 1 } }],
                        as: "owner",
                    },
                },
                {
                    $unwind: "$owner",
                }
            ]
            const aggregate = ProjectModel.aggregate(aggregateQuery)

            let options = {
                page: page,
                limit: limit,
            };
            let projects = await ProjectModel.aggregatePaginate(aggregate, options);

            // count of active and completed projects
            let activeCount = await ProjectModel.countDocuments({ isDeleted: false, users: { $in: [userId] }, status: "active" })
            let completeCount = await ProjectModel.countDocuments({ isDeleted: false, users: { $in: [userId] }, status: "completed" })

            return res.status(200).send({ msg: "Projects fetched successfully", success: true, status: 200, data: projects.docs, total: activeCount + completeCount, limit: projects.limit, page: projects.page, pages: projects.totalPages, activeCount: activeCount, completeCount: completeCount });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },

    // get project by id
    getProjectById: async (req, res) => {
        try {
            let userId = req.user._id;
            const project = await ProjectModel.findOne({ _id: req.params.id, isDeleted: false, users: { $in: [userId] } }).populate("owner", "name email");
            if (!project) {
                return res.status(404).send({ error: "Project not found", success: false, status: 404 });
            }
            return res.status(200).send({ msg: "Project fetched successfully", success: true, status: 200, data: project, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },


    // create project
    createProject: async (req, res) => {
        try {
            req.body.owner = req.user._id;
            req.body.users = [req.user._id];
            if (!isValid(req.body.title)) {
                return res.status(400).send({ error: "Title is required", success: false, status: 400 });
            }
            let project = await ProjectModel.create(req.body);
            return res.status(200).send({ msg: "Project created successfully", success: true, status: 200, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },


    // update project
    updateProject: async (req, res) => {
        try {
            const project = await ProjectModel.findById(req.params.id);
            if (!project) {
                return res.status(404).send({ error: "Project not found", success: false, status: 404 });
            }
            if (isValid(req.body.title)) {
                project.title = req.body.title;
            }
            if (isValid(req.body.description)) {
                project.description = req.body.description;
            }
            if (isValid(req.body.status)) {
                if (req.body.status == "completed") project.completedAt = new Date();
                project.status = req.body.status;
            }
            await project.save();
            return res.status(200).send({ msg: "Project updated successfully", success: true, status: 200, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },


    // delete project
    deleteProject: async (req, res) => {
        try {
            const project = await ProjectModel.findById(req.params.id);
            if (!project) {
                return res.status(404).send({ error: "Project not found", success: false, status: 404 });
            }
            project.isDeleted = true;
            await project.save();

            // delete tasks
            await TaskModel.updateMany({ project: req.params.id }, { isDeleted: true });

            return res.status(200).send({ msg: "Project deleted successfully", success: true, status: 200, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },


    // assign project
    assignProject: async (req, res) => {
        try {
            const project = await ProjectModel.findById(req.params.id);
            if (!project) {
                return res.status(404).send({ error: "Project not found", success: false, status: 404 });
            }
            project.users.push(req.body.userId);
            await project.save();
            return res.status(200).send({ msg: "Project assigned successfully", success: true, status: 200, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },

    dummyProject: async (user) => {
        try {
            let userId = user._id;
            // dummy project first
            const project1 = await ProjectModel.create(
                { title: "Website Redesign", description: "Redesign the company landing page and improve UX", owner: userId, users: [userId] },
            )

            let task1 = [
                { title: "Design wireframes", description: "Create wireframes for the new landing page", dueDate: "2025-11-30", project: project1._id, createdBy: userId, assignedTo: userId },
                { title: "Implement responsive design", description: "Implement responsive design for the new landing page", dueDate: "2025-10-10", project: project1._id, createdBy: userId, },
                { title: "Test and deploy", description: "Test and deploy the new landing page", dueDate: "2025-10-30", project: project1._id, createdBy: userId, assignedTo: userId },
            ]

            await TaskModel.insertMany(task1);

            // dummy project second
            const project2 = await ProjectModel.create(
                { title: "Mobile App Development", description: "Build a mobile app for our company", owner: userId, users: [userId] },
            )

            let task2 = [
                {
                    title: "Set up project structure",
                    description: "Initialize React Native project and configure dependencies", dueDate: "2025-11-30", project: project2._id, createdBy: userId, assignedTo: userId
                },
                {
                    title: "Implement authentication",
                    description: "Add login, signup, and forgot password flows", dueDate: "2025-10-10", project: project2._id, createdBy: userId,
                },
                {
                    title: "Push to App Store & Play Store",
                    description: "Prepare release builds and submit apps for review", dueDate: "2025-10-30", project: project2._id, createdBy: userId, assignedTo: userId
                },
            ]

            await TaskModel.insertMany(task2);

            console.log("Project created successfully");
            return "Project created successfully";
        } catch (error) {
            console.log(error);
            return error.msg;
        }
    }

}

module.exports = { ProjectController };