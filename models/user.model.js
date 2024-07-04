const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, unique: true, require: true },
    password: { type: String, require: true },
    status: { type: String, default: null },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("users", userSchema);
