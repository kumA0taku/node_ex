const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    username: { type: String, unique: true, require: true },
    password: { type: String, require: true },
    approve: { type: Boolean, default: false },
    token: { type: String },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("users", userSchema);
