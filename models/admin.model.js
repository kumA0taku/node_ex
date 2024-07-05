const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema(
  {
    username: { type: String, unique: true, require: true },
    password: { type: String, require: true },
    role: { type: String},
    token: { type: String },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("admin", adminSchema);
