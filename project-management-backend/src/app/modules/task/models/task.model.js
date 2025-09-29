const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const taskHistorySchema = new mongoose.Schema({
    changeField: { type: String },
    oldData: { type: String },
    newData: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changedAt: { type: Date },
});

const TaskSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        description: { type: String, trim: true, default: "" },
        status: { type: String, enum: ["todo", "in-progress", "done"], default: "todo" },
        dueDate: { type: Date, default: null },
        project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
        assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        history: [taskHistorySchema],
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        isDeleted: { type: Boolean, default: false },
    },
    { timestamps: true }
);

TaskSchema.plugin(mongooseAggregatePaginate);
const TaskModel = mongoose.model("Task", TaskSchema);
module.exports = { TaskModel };
