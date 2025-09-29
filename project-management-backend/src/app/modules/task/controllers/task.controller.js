const { TaskModel } = require("../models/task.model");
const { msg } = require("../../../../config/message");
const { isValid } = require("../../../middleware/validator.middleware");

const mongoose = require("mongoose");

const TaskController = {
    // Get All Task
    getAllTask: async (req, res) => {
        try {
            let { page = 1, limit = 10 } = req.query
            page = parseInt(page);
            limit = parseInt(limit);
            const userId = new mongoose.Types.ObjectId(req.user._id)
            let filter = { isDeleted: false, project: new mongoose.Types.ObjectId(req.params.projectId) }
            if (isValid(req.query.key)) {
                filter.$or = [
                    { title: { $regex: req.query.key, $options: "i" } },
                    { description: { $regex: req.query.key, $options: "i" } },
                ];
            }
            if (isValid(req.query.status)) {
                filter.status = req.query.status
            }
            const aggregate = TaskModel.aggregate([
                { $match: filter },
                {
                    $lookup: {
                        from: "assignedTo",
                        localField: "users",
                        foreignField: "_id",
                        pipeline: [{ $project: { name: 1 } }],
                        as: "assignedTo",
                    },
                },
                {
                    $unwind: {
                        path: "$assignedTo",
                        preserveNullAndEmptyArrays: true,
                    },
                }
            ])

            let options = {
                page: page,
                limit: limit,
            };
            let task = await TaskModel.aggregatePaginate(aggregate, options);


            // count of active and completed projects
            let todoCount = await TaskModel.countDocuments({ isDeleted: false, project: new mongoose.Types.ObjectId(req.params.projectId), status: "todo" })
            let inProgressCount = await TaskModel.countDocuments({ isDeleted: false, project: new mongoose.Types.ObjectId(req.params.projectId), status: "in-progress" })
            let completeCount = await TaskModel.countDocuments({ isDeleted: false, project: new mongoose.Types.ObjectId(req.params.projectId), status: "done" })
            let totalCount = todoCount + inProgressCount + completeCount

            return res.status(200).send({ msg: "Tasks fetched successfully", success: true, status: 200, data: task.docs, total: totalCount, limit: task.limit, page: task.page, pages: task.totalPages, todoCount, inProgressCount, completeCount, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },

    // get Task by id
    getTaskById: async (req, res) => {
        try {
            if (!isValid(req.query.id)) {
                return res.status(400).send({ error: "Task id is required", success: false, status: 400 });
            }
            const project = await TaskModel.findOne({ _id: req.query.id, isDeleted: false });
            if (!project) {
                return res.status(404).send({ error: "Project not found", success: false, status: 404 });
            }
            return res.status(200).send({ msg: "Project fetched successfully", success: true, status: 200, data: project, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },


    // create Task
    createTask: async (req, res) => {
        try {
            req.body.createdBy = req.user._id;
            if (!isValid(req.body.assignedTo)) req.body.assignedTo = null;
            if (!isValid(req.body.title)) {
                return res.status(400).send({ error: "Title is required", success: false, status: 400 });
            }
            let task = await TaskModel.create(req.body);
            return res.status(200).send({ msg: "Project created successfully", success: true, status: 200, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },


    // update Task
    updateTask: async (req, res) => {
        try {
            const task = await TaskModel.findByIdAndUpdate(
                req.params.id,
                {
                    $set: req.body,
                },
                { new: true }
            )
            if (!task) {
                return res.status(404).send({ error: "Task not found", success: false, status: 404 });
            }
            return res.status(200).send({ msg: "Task updated successfully", success: true, status: 200, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },


    // delete Task
    deleteTask: async (req, res) => {
        try {
            const task = await TaskModel.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { isDeleted: true },
                },
                { new: true }
            )
            if (!task) {
                return res.status(404).send({ error: "Task not found", success: false, status: 404 });
            }
            return res.status(200).send({ msg: "Task deleted successfully", success: true, status: 200, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },


    // assign Task
    assignTask: async (req, res) => {
        try {
            if (!isValid(req.body.userId)) {
                return res.status(400).send({ error: "User id is required", success: false, status: 400 });
            }
            const task = await TaskModel.findByIdAndUpdate(
                req.params.id,
                {
                    $set: { assignedTo: req.body.userId }
                },
                { new: true }
            )
            if (!task) {
                return res.status(404).send({ error: "Task not found", success: false, status: 404 });
            }
            return res.status(200).send({ msg: "Task assigned successfully", success: true, status: 200, });
        } catch (error) {
            return res.status(500).send({ error: error.message, success: false, status: 500 });
        }
    },

}

module.exports = { TaskController };