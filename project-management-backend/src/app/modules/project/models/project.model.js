const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate-v2");

const projectHistorySchema = new mongoose.Schema({
    changeField: { type: String, },
    oldData: { type: String },
    newData: { type: String },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    changedAt: { type: Date, },
});

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: ['active', 'completed'], default: 'active' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    completedAt: { type: Date, default: null },
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    history: [projectHistorySchema],
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

projectSchema.plugin(mongooseAggregatePaginate);
const ProjectModel = mongoose.model("Project", projectSchema);
module.exports = { ProjectModel };