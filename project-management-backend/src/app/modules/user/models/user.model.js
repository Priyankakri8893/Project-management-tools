const mongoose = require("mongoose");
const mongooseAggregatePaginate = require("mongoose-aggregate-paginate");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    password: { type: String, trim: true, default: "" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

UserSchema.plugin(mongooseAggregatePaginate);
const UserModel = mongoose.model("User", UserSchema);
module.exports = { UserModel };
